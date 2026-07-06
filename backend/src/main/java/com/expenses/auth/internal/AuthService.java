package com.expenses.auth.internal;

import com.expenses.category.CategoryDefaults;
import com.expenses.shared.user.User;
import com.expenses.shared.exception.RateLimitExceededException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.UserRepository;
import com.expenses.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);
    private static final String SCOPE_FULL_ACCESS = "full_access";
    private static final String SCOPE_PASSWORD_CHANGE = "password_change";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CategoryDefaults categoryDefaults;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    private final ConcurrentHashMap<String, FailedLogins> failedLoginsByUsername = new ConcurrentHashMap<>();
    private record FailedLogins(int count, Instant lastFailure) {}

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        String rateKey = request.getUsername().toLowerCase(Locale.ROOT);
        ensureNotRateLimited(rateKey);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> failedAttempt(rateKey));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw failedAttempt(rateKey);
        }

        failedLoginsByUsername.remove(rateKey);

        categoryDefaults.ensureDefaultCategoriesFor(user);

        String scope = user.isMustChangePassword() ? SCOPE_PASSWORD_CHANGE : SCOPE_FULL_ACCESS;
        String accessToken = jwtService.generateAccessToken(user, scope);
        String rawRefresh = generateAndSaveRefreshToken(user, UUID.randomUUID().toString());

        return new LoginResponseDTO(accessToken, rawRefresh, user.isMustChangePassword(), user.getUsername());
    }

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public TokenResponseDTO refresh(RefreshTokenRequestDTO request) {
        String hash = sha256(request.getRefreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));

        if (stored.getUsedAt() != null) {
            refreshTokenRepository.deleteByFamilyId(stored.getFamilyId());
            log.warn("Reuso de refresh token detectado para user {}; familia {} revocada",
                    stored.getUser().getId(), stored.getFamilyId());
            throw new BadCredentialsException("Refresh token reutilizado; sesión revocada");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByFamilyId(stored.getFamilyId());
            throw new BadCredentialsException("Refresh token expirado");
        }

        User user = stored.getUser();
        stored.setUsedAt(LocalDateTime.now());

        String scope = user.isMustChangePassword() ? SCOPE_PASSWORD_CHANGE : SCOPE_FULL_ACCESS;
        String accessToken = jwtService.generateAccessToken(user, scope);
        String rawRefresh = generateAndSaveRefreshToken(user, stored.getFamilyId());

        return new TokenResponseDTO(accessToken, rawRefresh);
    }

    @Transactional
    public TokenResponseDTO changePassword(Long userId, ChangePasswordRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Contraseña actual incorrecta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);
        log.info("Password cambiado para user {}; sesiones previas revocadas", user.getId());

        String accessToken = jwtService.generateAccessToken(user, SCOPE_FULL_ACCESS);
        String rawRefresh = generateAndSaveRefreshToken(user, UUID.randomUUID().toString());

        return new TokenResponseDTO(accessToken, rawRefresh);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        refreshTokenRepository.deleteByUser(user);
    }

    private void ensureNotRateLimited(String rateKey) {
        FailedLogins failures = failedLoginsByUsername.get(rateKey);
        if (failures == null || failures.count() < MAX_FAILED_ATTEMPTS) {
            return;
        }
        if (failures.lastFailure().plus(LOCKOUT_DURATION).isBefore(Instant.now())) {
            failedLoginsByUsername.remove(rateKey);
            return;
        }
        throw new RateLimitExceededException(
                "Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.");
    }

    private BadCredentialsException failedAttempt(String rateKey) {
        FailedLogins failures = failedLoginsByUsername.merge(rateKey, new FailedLogins(1, Instant.now()),
                (previous, ignored) -> new FailedLogins(previous.count() + 1, Instant.now()));
        log.warn("Login fallido para usuario '{}' (intento {})", rateKey, failures.count());
        return new BadCredentialsException("Credenciales inválidas");
    }

    private String generateAndSaveRefreshToken(User user, String familyId) {
        String raw = UUID.randomUUID().toString();
        String hash = sha256(raw);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setFamilyId(familyId);
        token.setExpiresAt(LocalDateTime.now().plusDays(30));
        refreshTokenRepository.save(token);

        return raw;
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible en la JVM", e);
        }
    }
}
