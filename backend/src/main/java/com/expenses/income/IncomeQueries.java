package com.expenses.income;

import com.expenses.income.internal.IncomeRepository;
import com.expenses.income.internal.UncategorizedTotals;
import com.expenses.shared.query.CategoryBreakdownRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class IncomeQueries {

    private final IncomeRepository incomeRepository;

    @Transactional(readOnly = true)
    public BigDecimal sumBetween(Long userId, LocalDate from, LocalDate to) {
        return incomeRepository.sumAmountByUserIdAndDateBetween(userId, from, to);
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownRow> breakdown(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return incomeRepository.findCategoryBreakdownByUserId(userId, from, to, walletId);
    }

    @Transactional(readOnly = true)
    public UncategorizedIncome uncategorized(Long userId, LocalDate from, LocalDate to, Long walletId) {
        UncategorizedTotals totals = incomeRepository.findUncategorizedTotals(userId, from, to, walletId);
        return new UncategorizedIncome(totals.getTotal(), totals.getCount());
    }
}
