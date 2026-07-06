package com.expenses.wallet;

import java.time.LocalDateTime;

public record WalletDeletedEvent(Long walletId, Long userId, LocalDateTime deletedAt) {
}
