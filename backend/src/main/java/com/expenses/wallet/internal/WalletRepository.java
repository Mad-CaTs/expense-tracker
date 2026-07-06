package com.expenses.wallet.internal;

import com.expenses.wallet.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<Wallet> findByIdAndUserId(Long id, Long userId);

}
