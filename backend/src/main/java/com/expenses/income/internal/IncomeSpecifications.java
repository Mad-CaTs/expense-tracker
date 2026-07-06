package com.expenses.income.internal;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class IncomeSpecifications {

    private IncomeSpecifications() {
    }

    public static Specification<Income> belongsToUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Income> dateBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> cb.between(root.get("date"), from, to);
    }

    public static Specification<Income> hasWallet(Long walletId) {
        return walletId == null ? null
                : (root, query, cb) -> cb.equal(root.get("wallet").get("id"), walletId);
    }
}
