package com.expenses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    @NotBlank private String currentPassword;
    @NotBlank @Size(min = 6) private String newPassword;
}
