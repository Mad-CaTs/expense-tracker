package com.expenses.recurring.internal;

import com.expenses.wallet.WalletDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class RecurringWalletHooks {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final RecurringOccurrenceRepository occurrenceRepository;

    @EventListener
    public void on(WalletDeletedEvent event) {
        occurrenceRepository.skipPendingByWalletId(event.userId(), event.walletId(), event.deletedAt());
        recurringExpenseRepository.softDeleteByWalletId(event.userId(), event.walletId(), event.deletedAt());
    }
}
