package com.expenses.wallet.internal;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WalletRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    @DecimalMin(value = "0.0", inclusive = true, message = "El saldo inicial no puede ser negativo")
    private BigDecimal initialBalance;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color inválido")
    private String color;

    @Size(max = 50)
    private String icon;

    private Long backgroundId;
}
