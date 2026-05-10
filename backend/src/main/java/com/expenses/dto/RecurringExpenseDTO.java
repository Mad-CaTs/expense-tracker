package com.expenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringExpenseDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    private String description;

    @NotBlank
    private String frequency; // MONTHLY, WEEKLY, YEARLY

    @NotNull
    private LocalDate startDate;

    private LocalDate nextDate;
    private boolean active;
}
