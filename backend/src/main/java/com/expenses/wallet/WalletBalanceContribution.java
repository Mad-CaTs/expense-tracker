package com.expenses.wallet;

import java.math.BigDecimal;
import java.util.Map;

public interface WalletBalanceContribution {

    BigDecimal inflow(Long userId, Long walletId);

    BigDecimal outflow(Long userId, Long walletId);

    Map<Long, BigDecimal> inflowsByWallet(Long userId);

    Map<Long, BigDecimal> outflowsByWallet(Long userId);
}
