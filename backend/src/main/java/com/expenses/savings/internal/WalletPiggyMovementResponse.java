package com.expenses.savings.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Un movimiento de alcancía visto desde la billetera, para la lista de
 * Reportes: lleva el nombre de su alcancía y el instante de alta para
 * ordenarse entre gastos e ingresos del mismo día.
 */
public record WalletPiggyMovementResponse(
        Long id,
        Long piggyBankId,
        String piggyName,
        PiggyMovementType type,
        BigDecimal amount,
        LocalDate date,
        String createdAt) {
}
