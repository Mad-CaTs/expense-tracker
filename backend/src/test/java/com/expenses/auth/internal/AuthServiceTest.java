package com.expenses.auth.internal;

import com.expenses.category.CategoryDefaults;
import com.expenses.shared.exception.RateLimitExceededException;
import com.expenses.shared.security.JwtService;
import com.expenses.shared.user.User;
import com.expenses.shared.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock CategoryDefaults categoryDefaults;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks AuthService authService;

    private LoginRequestDTO request;

    @BeforeEach
    void setUp() {
        request = new LoginRequestDTO();
        request.setUsername("markus");
        request.setPassword("wrong-pass");
    }

    @Test
    void login_afterFiveFailedAttempts_throwsRateLimit() {
        when(userRepository.findByUsername("markus")).thenReturn(Optional.empty());

        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RateLimitExceededException.class);
        verify(userRepository, times(5)).findByUsername("markus");
    }

    @Test
    void login_rateLimitKey_isCaseInsensitive() {
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());

        for (int i = 0; i < 5; i++) {
            request.setUsername(i % 2 == 0 ? "Markus" : "MARKUS");
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        request.setUsername("markus");
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void login_success_resetsFailedCounterAndSeedsDefaults() {
        User user = new User();
        user.setId(1L);
        user.setUsername("markus");
        user.setPasswordHash("hash");
        user.setMustChangePassword(false);

        when(userRepository.findByUsername("markus")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pass", "hash")).thenReturn(false);

        for (int i = 0; i < 4; i++) {
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }

        when(passwordEncoder.matches("good-pass", "hash")).thenReturn(true);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("token");
        request.setPassword("good-pass");
        assertThatCode(() -> authService.login(request)).doesNotThrowAnyException();
        verify(categoryDefaults).ensureDefaultCategoriesFor(user);

        request.setPassword("wrong-pass");
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_reusedToken_revokesWholeFamily() {
        RefreshToken stored = refreshToken("familia-1");
        stored.setUsedAt(java.time.LocalDateTime.now().minusMinutes(5));
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));

        RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
        refreshRequest.setRefreshToken("token-robado");

        assertThatThrownBy(() -> authService.refresh(refreshRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("revocada");
        verify(refreshTokenRepository).deleteByFamilyId("familia-1");
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void refresh_valid_marksUsedAndKeepsFamily() {
        RefreshToken stored = refreshToken("familia-1");
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));
        when(jwtService.generateAccessToken(any(), any())).thenReturn("token");

        RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
        refreshRequest.setRefreshToken("token-legitimo");

        assertThatCode(() -> authService.refresh(refreshRequest)).doesNotThrowAnyException();

        assertThat(stored.getUsedAt()).isNotNull();
        var captor = org.mockito.ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getFamilyId()).isEqualTo("familia-1");
        verify(refreshTokenRepository, never()).deleteByFamilyId(any());
    }

    private RefreshToken refreshToken(String familyId) {
        User user = new User();
        user.setId(1L);
        user.setUsername("markus");
        user.setMustChangePassword(false);

        RefreshToken token = new RefreshToken();
        token.setId(7L);
        token.setUser(user);
        token.setTokenHash("hash");
        token.setFamilyId(familyId);
        token.setExpiresAt(java.time.LocalDateTime.now().plusDays(10));
        return token;
    }
}
