package com.expenses.wallet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface WalletBalanceContribution {

    BigDecimal inflow(Long userId, Long walletId);

    BigDecimal outflow(Long userId, Long walletId);

    Map<Long, BigDecimal> inflowsByWallet(Long userId);

    Map<Long, BigDecimal> outflowsByWallet(Long userId);

    /**
     * Neto que este módulo aporta a la billetera hasta {@code cutoff} inclusive.
     *
     * <p>Un solo método y no un par inflow/outflow con fecha: el saldo a una
     * fecha solo necesita la diferencia, y separarlo duplicaría las consultas
     * sin que nadie use las mitades por separado.
     *
     * <p>Los gastos suman su importe COMPLETO, sin descontar la parte
     * reembolsable: ese dinero salió de la billetera igual, aunque alguien lo
     * deba. Es el mismo criterio que usa {@link #outflow}.
     */
    BigDecimal netUpTo(Long userId, Long walletId, LocalDate cutoff);

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
