package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.shared.validation.FieldLimits;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Alta de un préstamo SUELTO (sin gasto): presté/me prestaron efectivo. */
@Data
public class DebtRequest {

    @NotNull(message = "La dirección es obligatoria")
    private DebtDirection direction;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = FieldLimits.PERSON_NAME)
    private String personName;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    /** Obligatoria en un préstamo suelto: es la billetera que mueve el dinero. */
    @NotNull(message = "La billetera es obligatoria")
    private Long walletId;

    @Size(max = FieldLimits.DESCRIPTION)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate incurredOn;
}
