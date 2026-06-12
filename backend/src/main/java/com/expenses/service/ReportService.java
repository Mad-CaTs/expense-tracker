package com.expenses.service;

import com.expenses.dto.CategoryBreakdownDTO;
import com.expenses.dto.ReportSummaryDTO;
import com.expenses.repository.ExpenseRepository;
import com.expenses.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    public ReportSummaryDTO getSummary(String period, LocalDate from, LocalDate to, Long userId, Long categoryId) {
        LocalDate[] prev = previousPeriod(period, from, to);
        LocalDate prevFrom = prev[0];
        LocalDate prevTo = prev[1];

        BigDecimal current = categoryId != null
                ? expenseRepository.sumAmountByUserIdAndDateBetweenAndCategoryId(userId, from, to, categoryId)
                : expenseRepository.sumAmountByUserIdAndDateBetween(userId, from, to);
        BigDecimal previous = categoryId != null
                ? expenseRepository.sumAmountByUserIdAndDateBetweenAndCategoryId(userId, prevFrom, prevTo, categoryId)
                : expenseRepository.sumAmountByUserIdAndDateBetween(userId, prevFrom, prevTo);

        BigDecimal currentIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, from, to);
        BigDecimal previousIncome = incomeRepository.sumAmountByUserIdAndDateBetween(userId, prevFrom, prevTo);

        long days = ChronoUnit.DAYS.between(from, to) + 1;
        BigDecimal dailyAverage = days > 0
                ? current.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double changePercentage = 0.0;
        if (previous.compareTo(BigDecimal.ZERO) != 0) {
            changePercentage = current.subtract(previous)
                    .divide(previous, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        ReportSummaryDTO dto = new ReportSummaryDTO();
        dto.setCurrentTotal(current);
        dto.setPreviousTotal(previous);
        dto.setChangePercentage(changePercentage);
        dto.setDailyAverage(dailyAverage);
        dto.setPeriod(period);
        dto.setCurrentFrom(from.toString());
        dto.setCurrentTo(to.toString());
        dto.setPreviousFrom(prevFrom.toString());
        dto.setPreviousTo(prevTo.toString());
        dto.setCurrentIncome(currentIncome);
        dto.setPreviousIncome(previousIncome);
        dto.setNetBalance(currentIncome.subtract(current));
        return dto;
    }

    public List<CategoryBreakdownDTO> getCategoryBreakdown(LocalDate from, LocalDate to, Long userId, Long categoryId, String txType) {
        if ("INCOME".equalsIgnoreCase(txType)) {
            return getIncomeBreakdown(from, to, userId);
        }
        List<Object[]> raw = categoryId != null
                ? expenseRepository.findCategoryBreakdownByUserIdAndCategoryId(userId, from, to, categoryId)
                : expenseRepository.findCategoryBreakdownByUserId(userId, from, to);
        BigDecimal total = raw.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return raw.stream()
                .map(r -> toBreakdownDTO(r, total, "EXPENSE"))
                .toList();
    }

    private List<CategoryBreakdownDTO> getIncomeBreakdown(LocalDate from, LocalDate to, Long userId) {
        List<Object[]> raw = incomeRepository.findCategoryBreakdownByUserId(userId, from, to);
        Object[] uncategorized = incomeRepository.findUncategorizedTotals(userId, from, to).get(0);
        BigDecimal uncategorizedTotal = (BigDecimal) uncategorized[0];
        Long uncategorizedCount = (Long) uncategorized[1];

        BigDecimal total = raw.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(uncategorizedTotal, BigDecimal::add);

        List<CategoryBreakdownDTO> result = new java.util.ArrayList<>(
                raw.stream().map(r -> toBreakdownDTO(r, total, "INCOME")).toList()
        );

        if (uncategorizedTotal.compareTo(BigDecimal.ZERO) > 0) {
            double pct = total.compareTo(BigDecimal.ZERO) != 0
                    ? uncategorizedTotal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            result.add(new CategoryBreakdownDTO("Sin categoría", uncategorizedTotal, pct, uncategorizedCount, "#6B7280", "ellipsis", "INCOME"));
        }
        return result;
    }

    private CategoryBreakdownDTO toBreakdownDTO(Object[] r, BigDecimal total, String type) {
        String name = (String) r[0];
        BigDecimal amount = (BigDecimal) r[1];
        Long count = (Long) r[2];
        String color = (String) r[3];
        String icon = (String) r[4];
        double pct = total.compareTo(BigDecimal.ZERO) != 0
                ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        return new CategoryBreakdownDTO(name, amount, pct, count, color, icon, type);
    }

    private LocalDate[] previousPeriod(String period, LocalDate from, LocalDate to) {
        return switch (period) {
            case "DAILY" -> new LocalDate[]{ from.minusDays(1), to.minusDays(1) };
            case "WEEKLY" -> new LocalDate[]{ from.minusWeeks(1), to.minusWeeks(1) };
            case "MONTHLY" -> {
                LocalDate prevFrom = from.minusMonths(1);
                LocalDate prevTo = prevFrom.withDayOfMonth(prevFrom.lengthOfMonth());
                yield new LocalDate[]{ prevFrom, prevTo };
            }
            case "YEARLY" -> new LocalDate[]{ from.minusYears(1), to.minusYears(1) };
            case "ALL" -> new LocalDate[]{ from, to };
            default -> {
                long days = ChronoUnit.DAYS.between(from, to) + 1;
                yield new LocalDate[]{ from.minusDays(days), to.minusDays(days) };
            }
        };
    }
}
