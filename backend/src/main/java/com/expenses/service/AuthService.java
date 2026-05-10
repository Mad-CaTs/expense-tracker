package com.expenses.service;

import com.expenses.dto.*;
import com.expenses.entity.Category;
import com.expenses.entity.RefreshToken;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.RefreshTokenRepository;
import com.expenses.repository.UserRepository;
import com.expenses.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CategoryRepository categoryRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        if (!categoryRepository.existsByUserId(user.getId())) {
            seedDefaultCategories(user);
        }

        String scope = user.isMustChangePassword() ? "password_change" : "full_access";
        String accessToken = jwtService.generateAccessToken(user, scope);
        String rawRefresh = generateAndSaveRefreshToken(user);

        return new LoginResponseDTO(accessToken, rawRefresh, user.isMustChangePassword(), user.getUsername());
    }

    @Transactional
    public TokenResponseDTO refresh(RefreshTokenRequestDTO request) {
        String hash = sha256(request.getRefreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new BadCredentialsException("Refresh token expirado");
        }

        User user = stored.getUser();
        refreshTokenRepository.delete(stored);

        String scope = user.isMustChangePassword() ? "password_change" : "full_access";
        String accessToken = jwtService.generateAccessToken(user, scope);
        String rawRefresh = generateAndSaveRefreshToken(user);

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

        String accessToken = jwtService.generateAccessToken(user, "full_access");
        String rawRefresh = generateAndSaveRefreshToken(user);

        return new TokenResponseDTO(accessToken, rawRefresh);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        refreshTokenRepository.deleteByUser(user);
    }

    private String generateAndSaveRefreshToken(User user) {
        String raw = UUID.randomUUID().toString();
        String hash = sha256(raw);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setExpiresAt(LocalDateTime.now().plusDays(30));
        refreshTokenRepository.save(token);

        return raw;
    }

    private void seedDefaultCategories(User user) {
        List<Category> defaults = List.of(
            category("Comida",          "#EF4444", "utensils",      user),
            category("Transporte",      "#3B82F6", "car",           user),
            category("Salud",           "#10B981", "heart-pulse",   user),
            category("Entretenimiento", "#8B5CF6", "film",          user),
            category("Hogar",           "#F59E0B", "home",          user),
            category("Otros",           "#6B7280", "ellipsis",      user)
        );
        categoryRepository.saveAll(defaults);
    }

    private Category category(String name, String color, String icon, User user) {
        Category c = new Category();
        c.setName(name);
        c.setColor(color);
        c.setIcon(icon);
        c.setUser(user);
        return c;
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
