package com.expenses.budget.internal;

import com.expenses.wallet.WalletDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class BudgetWalletHooks {

    private final BudgetRepository budgetRepository;

    @EventListener
    public void on(WalletDeletedEvent event) {
        budgetRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }
}
