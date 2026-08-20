package com.expenses.auth.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticatedUserResolver userResolver;

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public TokenResponseDTO refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return authService.refresh(request);
    }

    @PostMapping("/change-password")
    public TokenResponseDTO changePassword(@Valid @RequestBody ChangePasswordRequestDTO request) {
        return authService.changePassword(userResolver.getCurrentUserId(), request);
    }

    /** El cliente avisa que el usuario terminó el onboarding. */
    @PostMapping("/complete-onboarding")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void completeOnboarding() {
        authService.completeOnboarding(userResolver.getCurrentUserId());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        authService.logout(userResolver.getCurrentUserId());
    }
}
