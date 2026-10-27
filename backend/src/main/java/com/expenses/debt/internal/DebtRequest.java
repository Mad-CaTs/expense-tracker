package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.shared.validation.FieldLimits;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Alta de una deuda SUELTA (sin gasto): un préstamo, o alguien que pagó por mí. */
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

    /** Préstamo (por defecto) o "pagó por mí". Ver {@link DebtKind}. */
    private DebtKind kind = DebtKind.LOAN;

    /**
     * Obligatoria en un PRÉSTAMO: es la billetera que mueve el dinero. En
     * "pagó por mí" se ignora —no entró dinero a ninguna—; la valida el servicio
     * porque depende del tipo.
     */
    private Long walletId;

    @Size(max = FieldLimits.DESCRIPTION)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate incurredOn;
}
