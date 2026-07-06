package com.expenses.shared.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String HEADER = "Idempotency-Key";
    public static final String REPLAY_HEADER = "Idempotency-Replay";

    private static final Set<String> FINANCIAL_POST_PATHS =
            Set.of("/api/expenses", "/api/incomes", "/api/transfers");

    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String key = request.getHeader(HEADER);
        return !("POST".equalsIgnoreCase(request.getMethod())
                && FINANCIAL_POST_PATHS.contains(request.getRequestURI())
                && key != null && !key.isBlank());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            chain.doFilter(request, response);
            return;
        }

        CachedBodyRequest cachedRequest = new CachedBodyRequest(request);
        String key = request.getHeader(HEADER);
        String requestHash = sha256(request.getMethod() + '\n' + request.getRequestURI() + '\n'
                + new String(cachedRequest.body, StandardCharsets.UTF_8));

        Long registrationId;
        try {
            registrationId = idempotencyService.register(userId, key, requestHash, request.getRequestURI());
        } catch (DataIntegrityViolationException duplicate) {
            handleExistingKey(userId, key, requestHash, request, response);
            return;
        }

        executeAndMemorize(cachedRequest, response, chain, registrationId);
    }

    private void executeAndMemorize(CachedBodyRequest request, HttpServletResponse response,
                                    FilterChain chain, Long registrationId) throws ServletException, IOException {
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        try {
            chain.doFilter(request, responseWrapper);
            int status = responseWrapper.getStatus();
            if (status >= 200 && status < 300) {
                idempotencyService.complete(registrationId, status,
                        new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8));
            } else {
                idempotencyService.discard(registrationId);
            }
            responseWrapper.copyBodyToResponse();
        } catch (ServletException | IOException | RuntimeException ex) {
            idempotencyService.discard(registrationId);
            throw ex;
        }
    }

    private void handleExistingKey(Long userId, String key, String requestHash,
                                   HttpServletRequest request, HttpServletResponse response) throws IOException {
        Optional<IdempotencyKey> existing = idempotencyService.findExisting(userId, key);
        if (existing.isEmpty()) {
            writeProblem(response, request, HttpStatus.CONFLICT,
                    "La petición original con esta Idempotency-Key falló; reintenta");
            return;
        }
        IdempotencyKey entry = existing.get();
        if (!entry.getRequestHash().equals(requestHash)) {
            writeProblem(response, request, HttpStatus.CONFLICT,
                    "La Idempotency-Key ya fue usada con un payload distinto");
            return;
        }
        if (entry.getResponseStatus() == null) {
            writeProblem(response, request, HttpStatus.CONFLICT,
                    "Hay una petición en curso con la misma Idempotency-Key");
            return;
        }
        log.info("Idempotency replay para user {} en {}", userId, entry.getRequestPath());
        response.setStatus(entry.getResponseStatus());
        response.setHeader(REPLAY_HEADER, "true");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(entry.getResponseBody());
    }

    private void writeProblem(HttpServletResponse response, HttpServletRequest request,
                              HttpStatus status, String detail) throws IOException {
        log.warn("Conflicto de idempotencia en {} {}: {}",
                request.getMethod(), request.getRequestURI(), detail);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle("Conflicto de idempotencia");
        pd.setInstance(URI.create(request.getRequestURI()));
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(pd));
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static class CachedBodyRequest extends HttpServletRequestWrapper {

        private final byte[] body;

        CachedBodyRequest(HttpServletRequest request) throws IOException {
            super(request);
            this.body = request.getInputStream().readAllBytes();
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream buffer = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override public int read() { return buffer.read(); }
                @Override public boolean isFinished() { return buffer.available() == 0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) {
                    // Sin operación: el cuerpo ya está buffereado en memoria (lectura síncrona),
                    // por lo que no hay E/S asíncrona que notificar a un ReadListener.
                }
            };
        }

        @Override
        public java.io.BufferedReader getReader() {
            return new java.io.BufferedReader(new java.io.InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
