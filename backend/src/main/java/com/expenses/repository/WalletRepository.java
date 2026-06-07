package com.expenses.repository;

import com.expenses.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<Wallet> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserId(Long userId);
}
