package com.expenses.savings.internal;

import com.expenses.wallet.PerWalletTotal;
import com.expenses.wallet.WalletBalanceContribution;
import com.expenses.wallet.WalletDeletedEvent;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.expenses.savings.internal.PiggyMovementType.DEPOSIT;
import static com.expenses.savings.internal.PiggyMovementType.WITHDRAWAL;

/**
 * Aporte de las alcancías al saldo de la billetera.
 *
 * <p>Guardar SALE del disponible y sacar VUELVE a él. Así el saldo que calcula
 * la billetera es directamente el disponible, sin que ningún otro módulo
 * tenga que saber que existen alcancías.
 *
 * <p>Cuentan también los movimientos de alcancías rotas: el retiro final que
 * deja la ruptura compensa sus depósitos, y los cierres pasados se conservan.
 */
@Component
@RequiredArgsConstructor
class PiggyWalletHooks implements WalletBalanceContribution {

    private final PiggyMovementRepository movementRepository;
    private final PiggyBankRepository piggyBankRepository;

    @Override
    public BigDecimal inflow(Long userId, Long walletId) {
        return movementRepository.sumByWalletAndType(userId, walletId, WITHDRAWAL);
    }

    @Override
    public BigDecimal outflow(Long userId, Long walletId) {
        return movementRepository.sumByWalletAndType(userId, walletId, DEPOSIT);
    }

    @Override
    public Map<Long, BigDecimal> inflowsByWallet(Long userId) {
        return toMap(movementRepository.sumGroupedByWallet(userId, WITHDRAWAL));
    }

    @Override
    public Map<Long, BigDecimal> outflowsByWallet(Long userId) {
        return toMap(movementRepository.sumGroupedByWallet(userId, DEPOSIT));
    }

    @Override
    public BigDecimal netUpTo(Long userId, Long walletId, LocalDate cutoff) {
        return movementRepository.sumByWalletAndTypeUpTo(userId, walletId, WITHDRAWAL, cutoff)
                .subtract(movementRepository.sumByWalletAndTypeUpTo(userId, walletId, DEPOSIT, cutoff));
    }

    @Override
    public boolean hasMovements(Long userId, Long walletId) {
        return movementRepository.existsByUserIdAndWalletId(userId, walletId);
    }

    @EventListener
    @Transactional
    public void on(WalletDeletedEvent event) {
        movementRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
        piggyBankRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }

    private Map<Long, BigDecimal> toMap(List<PerWalletTotal> totals) {
        return totals.stream().collect(Collectors.toMap(PerWalletTotal::getWalletId, PerWalletTotal::getTotal));
    }
}
