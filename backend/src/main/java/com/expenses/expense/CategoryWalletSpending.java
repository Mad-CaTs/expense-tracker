package com.expenses.expense;

import java.math.BigDecimal;

public record CategoryWalletSpending(Long categoryId, Long walletId, BigDecimal total) {
}
