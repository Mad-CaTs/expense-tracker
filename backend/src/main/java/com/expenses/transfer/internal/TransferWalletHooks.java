package com.expenses.transfer.internal;

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
class TransferWalletHooks implements WalletBalanceContribution {

    private final TransferRepository transferRepository;

    @Override
    public BigDecimal inflow(Long userId, Long walletId) {
        return transferRepository.sumIncomingByUserIdAndWalletId(userId, walletId);
    }

    @Override
    public BigDecimal outflow(Long userId, Long walletId) {
        return transferRepository.sumOutgoingByUserIdAndWalletId(userId, walletId);
    }

    @Override
    public Map<Long, BigDecimal> inflowsByWallet(Long userId) {
        return toMap(transferRepository.sumIncomingByUserIdGroupedByWallet(userId));
    }

    @Override
    public Map<Long, BigDecimal> outflowsByWallet(Long userId) {
        return toMap(transferRepository.sumOutgoingByUserIdGroupedByWallet(userId));
    }

    @EventListener
    public void on(WalletDeletedEvent event) {
        transferRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }

    private Map<Long, BigDecimal> toMap(java.util.List<PerWalletTotal> totals) {
        return totals.stream().collect(Collectors.toMap(PerWalletTotal::getWalletId, PerWalletTotal::getTotal));
    }
}
