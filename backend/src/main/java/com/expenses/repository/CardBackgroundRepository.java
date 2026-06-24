package com.expenses.repository;

import com.expenses.entity.CardBackground;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardBackgroundRepository extends JpaRepository<CardBackground, Long> {
    List<CardBackground> findAllByOrderByPositionAsc();
}
