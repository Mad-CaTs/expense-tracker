package com.expenses.wallet.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardBackgroundRepository extends JpaRepository<CardBackground, Long> {
    List<CardBackground> findAllByOrderByPositionAsc();
}
