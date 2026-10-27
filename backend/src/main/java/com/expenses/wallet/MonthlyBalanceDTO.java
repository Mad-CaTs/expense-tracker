package com.expenses.wallet;

import java.math.BigDecimal;

/**
 * Saldo de cierre de un mes en una billetera.
 *
 * @param month  mes en formato {@code yyyy-MM}
 * @param balance saldo al último día de ese mes
 */
public record MonthlyBalanceDTO(String month, BigDecimal balance) {}
