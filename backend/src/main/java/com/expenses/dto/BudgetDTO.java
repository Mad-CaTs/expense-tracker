package com.expenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull @Min(1) @Max(12)
    private Integer month;

    @NotNull @Min(2020)
    private Integer year;

    // Calculado: gasto real en ese mes/año para esta categoría
    private BigDecimal spent;
    private double percentage;
}
