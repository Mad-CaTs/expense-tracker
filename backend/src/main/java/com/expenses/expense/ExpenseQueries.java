package com.expenses.expense;

import com.expenses.expense.internal.ExpenseRepository;
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
public class ExpenseQueries {

    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public BigDecimal spentInMonth(Long userId, Long categoryId, Long walletId, int month, int year) {
        return expenseRepository.sumSpentByCategoryWalletAndPeriod(userId, categoryId, walletId, month, year);
    }

    @Transactional(readOnly = true)
    public List<CategoryWalletSpending> spentInMonthGrouped(Long userId, int month, int year) {
        return expenseRepository.sumSpentByPeriodGroupedByCategoryAndWallet(userId, month, year)
                .stream()
                .map(s -> new CategoryWalletSpending(s.getCategoryId(), s.getWalletId(), s.getTotal()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal sumBetween(Long userId, LocalDate from, LocalDate to) {
        return expenseRepository.sumAmountByUserIdAndDateBetween(userId, from, to);
    }

    @Transactional(readOnly = true)
    public BigDecimal sumBetweenForCategory(Long userId, LocalDate from, LocalDate to, Long categoryId) {
        return expenseRepository.sumAmountByUserIdAndDateBetweenAndCategoryId(userId, from, to, categoryId);
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownRow> breakdown(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return expenseRepository.findCategoryBreakdownByUserId(userId, from, to, walletId);
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownRow> breakdownForCategory(Long userId, LocalDate from, LocalDate to, Long categoryId, Long walletId) {
        return expenseRepository.findCategoryBreakdownByUserIdAndCategoryId(userId, from, to, categoryId, walletId);
    }

    /** Total por día del periodo, para el ritmo de /reports. */
    @Transactional(readOnly = true)
    public List<DailyTotalRow> dailyTotals(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return expenseRepository.findDailyTotals(userId, from, to, walletId);
    }

    /** Gasto por día y categoría, para deducir la dominante de cada día. */
    @Transactional(readOnly = true)
    public List<DailyCategoryRow> dailyByCategory(Long userId, LocalDate from, LocalDate to, Long walletId) {
        return expenseRepository.findDailyByCategory(userId, from, to, walletId);
    }
}
