package com.expenses.wallet;

import java.math.BigDecimal;
import java.util.Map;

public interface WalletBalanceContribution {

    BigDecimal inflow(Long userId, Long walletId);

    BigDecimal outflow(Long userId, Long walletId);

    Map<Long, BigDecimal> inflowsByWallet(Long userId);

    Map<Long, BigDecimal> outflowsByWallet(Long userId);

    /**
     * ¿Este módulo tiene algún registro en esa billetera?
     *
     * <p>No se deduce de {@link #inflow}/{@link #outflow}: un gasto de 100 y un
     * ingreso de 100 dan neto cero y la billetera SÍ tiene movimientos. Quien
     * decide si la moneda puede cambiarse necesita saber si existe alguno, no
     * cuánto suman.
     */
    boolean hasMovements(Long userId, Long walletId);
}
