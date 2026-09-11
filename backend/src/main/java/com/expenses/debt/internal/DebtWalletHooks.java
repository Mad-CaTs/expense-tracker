package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.wallet.PerWalletTotal;
import com.expenses.wallet.WalletBalanceContribution;
import com.expenses.wallet.WalletDeletedEvent;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Aporte de las deudas al saldo derivado de la billetera.
 *
 * <p>El saldo sigue el DINERO REAL, no la parte propia del gasto:
 *
 * <table>
 *   <tr><td>Deuda que cuelga de un gasto</td><td>0 al crearse — el Expense ya descontó el total</td></tr>
 *   <tr><td>Préstamo suelto THEY_OWE</td><td>outflow — salió dinero sin gasto que lo registre</td></tr>
 *   <tr><td>Préstamo suelto I_OWE</td><td>inflow — entró dinero prestado</td></tr>
 *   <tr><td>Cobro sobre THEY_OWE</td><td>inflow — vuelve el dinero</td></tr>
 *   <tr><td>Pago sobre I_OWE</td><td>outflow — se devuelve</td></tr>
 * </table>
 *
 * <p>Si una deuda ligada a un gasto descontara saldo, el dinero se restaría dos
 * veces y el saldo dejaría de cuadrar con el banco.
 */
@Component
@RequiredArgsConstructor
class DebtWalletHooks implements WalletBalanceContribution {

    private final DebtRepository debtRepository;
    private final DebtPaymentRepository paymentRepository;

    @Override
    public BigDecimal inflow(Long userId, Long walletId) {
        return debtRepository.sumLooseByWalletAndDirection(userId, walletId, DebtDirection.I_OWE)
                .add(paymentRepository.sumByWalletAndDirection(userId, walletId, DebtDirection.THEY_OWE));
    }

    @Override
    public BigDecimal outflow(Long userId, Long walletId) {
        return debtRepository.sumLooseByWalletAndDirection(userId, walletId, DebtDirection.THEY_OWE)
                .add(paymentRepository.sumByWalletAndDirection(userId, walletId, DebtDirection.I_OWE));
    }

    @Override
    public Map<Long, BigDecimal> inflowsByWallet(Long userId) {
        Map<Long, BigDecimal> totals = new HashMap<>();
        merge(totals, debtRepository.sumLooseGroupedByWallet(userId, DebtDirection.I_OWE));
        merge(totals, paymentRepository.sumGroupedByWallet(userId, DebtDirection.THEY_OWE));
        return totals;
    }

    @Override
    public Map<Long, BigDecimal> outflowsByWallet(Long userId) {
        Map<Long, BigDecimal> totals = new HashMap<>();
        merge(totals, debtRepository.sumLooseGroupedByWallet(userId, DebtDirection.THEY_OWE));
        merge(totals, paymentRepository.sumGroupedByWallet(userId, DebtDirection.I_OWE));
        return totals;
    }

    /**
     * Al borrar una billetera se van sus cobros y los préstamos sueltos que
     * salieron de ella. Las deudas ligadas a un gasto NO cuelgan de la billetera
     * (su wallet es nula): las arrastra el borrado del gasto.
     */
    @Override
    public boolean hasMovements(Long userId, Long walletId) {
        // Préstamos sueltos y abonos: ambos mueven dinero en la billetera.
        // Una deuda nacida de un gasto no tiene billetera propia, así que no
        // aparece aquí — la bloquea el gasto que la originó.
        return debtRepository.existsByUserIdAndWalletId(userId, walletId)
                || paymentRepository.existsByUserIdAndWalletId(userId, walletId);
    }

    @EventListener
    @Transactional
    public void on(WalletDeletedEvent event) {
        paymentRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
        debtRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }

    /** Dos fuentes pueden aportar a la misma billetera; se suman, no se pisan. */
    private void merge(Map<Long, BigDecimal> totals, List<PerWalletTotal> rows) {
        for (PerWalletTotal row : rows) {
            if (row.getWalletId() == null) continue;
            totals.merge(row.getWalletId(), row.getTotal(), BigDecimal::add);
        }
    }
}
