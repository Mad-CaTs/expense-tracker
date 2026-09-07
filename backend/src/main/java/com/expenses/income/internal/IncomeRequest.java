package com.expenses.income.internal;

import com.expenses.shared.validation.FieldLimits;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeRequest {

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @Size(max = FieldLimits.DESCRIPTION)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate date;

    @Size(max = FieldLimits.NOTES)
    private String notes;

    private Long walletId;

    private Long categoryId;
}
