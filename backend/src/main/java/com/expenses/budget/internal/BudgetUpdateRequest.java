package com.expenses.budget.internal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetUpdateRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}
