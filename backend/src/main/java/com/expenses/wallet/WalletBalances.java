package com.expenses.wallet;

import com.expenses.wallet.internal.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Saldo de una billetera para otros módulos.
 *
 * <p>Es el saldo DISPONIBLE: lo apartado en alcancías ya está restado, porque
 * las alcancías aportan al saldo como cualquier otro módulo.
 */
@Component
@RequiredArgsConstructor
public class WalletBalances {

    private final WalletService walletService;

    public BigDecimal available(Long walletId, Long userId) {
        return walletService.calculateBalance(walletId, userId);
    }
}
