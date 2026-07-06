package com.expenses.expense.internal;

import com.expenses.wallet.PerWalletTotal;
import com.expenses.wallet.WalletBalanceContribution;
import com.expenses.wallet.WalletDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
class ExpenseWalletHooks implements WalletBalanceContribution {

    private final ExpenseRepository expenseRepository;

    @Override
    public BigDecimal inflow(Long userId, Long walletId) {
        return BigDecimal.ZERO;
    }

    @Override
    public BigDecimal outflow(Long userId, Long walletId) {
        return expenseRepository.sumAmountByUserIdAndWalletId(userId, walletId);
    }

    @Override
    public Map<Long, BigDecimal> inflowsByWallet(Long userId) {
        return Map.of();
    }

    @Override
    public Map<Long, BigDecimal> outflowsByWallet(Long userId) {
        return toMap(expenseRepository.sumAmountByUserIdGroupedByWallet(userId));
    }

    @EventListener
    public void on(WalletDeletedEvent event) {
        expenseRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }

    private Map<Long, BigDecimal> toMap(java.util.List<PerWalletTotal> totals) {
        return totals.stream().collect(Collectors.toMap(PerWalletTotal::getWalletId, PerWalletTotal::getTotal));
    }
}
