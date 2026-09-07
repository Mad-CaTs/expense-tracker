package com.expenses.recurring.internal;

import com.expenses.shared.validation.FieldLimits;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    // Sin este @Size la descripción no tenía tope y reventaba como error de
    // base de datos al pasar de varchar(255).
    @Size(max = FieldLimits.DESCRIPTION)
    private String description;

    @NotBlank
    private String frequency;

    @NotNull
    private LocalDate startDate;
}
