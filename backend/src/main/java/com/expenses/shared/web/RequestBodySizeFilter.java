package com.expenses.shared.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;


@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RequestBodySizeFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Value("${app.http.max-body-bytes}")
    private long maxBodyBytes;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        long contentLength = request.getContentLengthLong();
        if (contentLength > maxBodyBytes) {
            log.warn("Body rechazado por tamaño ({} bytes > {}): {} {} desde {}",
                    contentLength, maxBodyBytes, request.getMethod(), request.getRequestURI(),
                    request.getRemoteAddr());
            ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                    HttpStatus.PAYLOAD_TOO_LARGE, "El cuerpo de la petición supera el tamaño máximo permitido");
            pd.setTitle("Cuerpo demasiado grande");
            pd.setInstance(URI.create(request.getRequestURI()));
            response.setStatus(HttpStatus.PAYLOAD_TOO_LARGE.value());
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(pd));
            return;
        }
        chain.doFilter(request, response);
    }
}
