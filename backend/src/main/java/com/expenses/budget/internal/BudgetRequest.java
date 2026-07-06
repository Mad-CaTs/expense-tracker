package com.expenses.budget.internal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @NotNull
    private Long walletId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}
