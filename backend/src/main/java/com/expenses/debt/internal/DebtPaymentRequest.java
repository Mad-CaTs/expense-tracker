package com.expenses.debt.internal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Cobro (o pago) sobre una deuda, con su propia fecha y billetera. */
@Data
public class DebtPaymentRequest {

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotNull(message = "La billetera es obligatoria")
    private Long walletId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate paidOn;
}
