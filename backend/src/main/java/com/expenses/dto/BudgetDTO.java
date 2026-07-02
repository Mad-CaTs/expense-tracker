package com.expenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;

    @NotNull
    private Long walletId;
    private String walletName;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    // Calculado: gasto real del mes actual para esta categoría en este wallet
    private BigDecimal spent;
    private double percentage;
}
