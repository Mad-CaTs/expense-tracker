package com.expenses.recurring.internal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringExpenseRequest {

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @NotNull
    private Long walletId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    private String description;

    @NotBlank
    private String frequency;

    @NotNull
    private LocalDate startDate;
}
