package com.expenses.income;

import com.expenses.income.internal.IncomeRepository;
import com.expenses.income.internal.UncategorizedTotals;
import com.expenses.shared.query.CategoryBreakdownRow;
import com.expenses.shared.query.DailyCategoryRow;
import com.expenses.shared.query.DailyTotalRow;
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

    /** Total por día del periodo, para el ritmo de /reports. */
    @Transactional(readOnly = true)
    public List<DailyTotalRow> dailyTotals(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return incomeRepository.findDailyTotals(userId, from, to, walletId);
    }

    /** Gasto por día y categoría, para deducir la dominante de cada día. */
    @Transactional(readOnly = true)
    public List<DailyCategoryRow> dailyByCategory(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return incomeRepository.findDailyByCategory(userId, from, to, walletId);
    }
}
