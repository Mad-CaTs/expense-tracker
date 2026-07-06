package com.expenses.wallet;

import com.expenses.wallet.internal.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WalletFinder {

    private final WalletRepository walletRepository;

    public Optional<Wallet> findOwned(Long walletId, Long userId) {
        return walletRepository.findByIdAndUserId(walletId, userId);
    }
}
