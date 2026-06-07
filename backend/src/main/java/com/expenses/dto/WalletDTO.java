package com.expenses.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WalletDTO {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    @NotNull(message = "El saldo inicial es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El saldo inicial no puede ser negativo")
    private BigDecimal initialBalance;

    private BigDecimal balance;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color inválido")
    private String color;

    @Size(max = 50)
    private String icon;
}
