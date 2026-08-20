package com.expenses.auth.internal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String refreshToken;
    private boolean mustChangePassword;
    /** false mientras el usuario no haya terminado el onboarding. */
    private boolean onboardingCompleted;
    private String username;
}
