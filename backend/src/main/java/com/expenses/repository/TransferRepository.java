package com.expenses.repository;

import com.expenses.entity.Transfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    Page<Transfer> findByUserIdOrderByDateDescCreatedAtDesc(Long userId, Pageable pageable);

    Page<Transfer> findByUserIdAndFromWalletIdOrUserIdAndToWalletId(
            Long userId1, Long fromWalletId, Long userId2, Long toWalletId, Pageable pageable);

    Optional<Transfer> findByIdAndUserId(Long id, Long userId);
}
