package com.expenses.report.internal;

import com.expenses.expense.ExpenseQueries;
import com.expenses.income.IncomeQueries;
import com.expenses.income.UncategorizedIncome;
import com.expenses.shared.query.CategoryBreakdownRow;
import com.expenses.shared.query.DailyCategoryRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final String TX_INCOME = "INCOME";
    private static final String TX_EXPENSE = "EXPENSE";

    private final ExpenseQueries expenseQueries;
    private final IncomeQueries incomeQueries;

    @Transactional(readOnly = true)
    public ReportSummaryDTO getSummary(String period, LocalDate from, LocalDate to, Long userId, Long categoryId) {
        LocalDate[] prev = previousPeriod(period, from, to);
        LocalDate prevFrom = prev[0];
        LocalDate prevTo = prev[1];

        BigDecimal current = categoryId != null
                ? expenseQueries.sumBetweenForCategory(userId, from, to, categoryId)
                : expenseQueries.sumBetween(userId, from, to);
        BigDecimal previous = categoryId != null
                ? expenseQueries.sumBetweenForCategory(userId, prevFrom, prevTo, categoryId)
                : expenseQueries.sumBetween(userId, prevFrom, prevTo);

        BigDecimal currentIncome = incomeQueries.sumBetween(userId, from, to);
        BigDecimal previousIncome = incomeQueries.sumBetween(userId, prevFrom, prevTo);

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

    @Transactional(readOnly = true)
    public List<CategoryBreakdownDTO> getCategoryBreakdown(LocalDate from, LocalDate to, Long userId, Long categoryId, String txType, Long walletId) {
        if (TX_INCOME.equalsIgnoreCase(txType)) {
            return getIncomeBreakdown(from, to, userId, walletId);
        }
        List<CategoryBreakdownRow> rows = categoryId != null
                ? expenseQueries.breakdownForCategory(userId, from, to, categoryId, walletId)
                : expenseQueries.breakdown(userId, from, to, walletId);
        BigDecimal total = rows.stream()
                .map(CategoryBreakdownRow::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rows.stream()
                .map(row -> toBreakdownDTO(row, total, TX_EXPENSE))
                .toList();
    }

    private List<CategoryBreakdownDTO> getIncomeBreakdown(LocalDate from, LocalDate to, Long userId, Long walletId) {
        List<CategoryBreakdownRow> rows = incomeQueries.breakdown(userId, from, to, walletId);
        UncategorizedIncome uncategorized = incomeQueries.uncategorized(userId, from, to, walletId);
        BigDecimal uncategorizedTotal = uncategorized.total();

        BigDecimal total = rows.stream()
                .map(CategoryBreakdownRow::getTotal)
                .reduce(uncategorizedTotal, BigDecimal::add);

        List<CategoryBreakdownDTO> result = new java.util.ArrayList<>(
                rows.stream().map(row -> toBreakdownDTO(row, total, TX_INCOME)).toList()
        );

        if (uncategorizedTotal.compareTo(BigDecimal.ZERO) > 0) {
            double pct = total.compareTo(BigDecimal.ZERO) != 0
                    ? uncategorizedTotal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            result.add(new CategoryBreakdownDTO("Sin categoría", uncategorizedTotal, pct, uncategorized.count(), "#6B7280", "ellipsis", TX_INCOME));
        }
        return result;
    }

    private CategoryBreakdownDTO toBreakdownDTO(CategoryBreakdownRow row, BigDecimal total, String type) {
        double pct = total.compareTo(BigDecimal.ZERO) != 0
                ? row.getTotal().divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        return new CategoryBreakdownDTO(row.getName(), row.getTotal(), pct, row.getCount(), row.getColor(), row.getIcon(), type);
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

    /**
     * Total por día del periodo, con la categoría DOMINANTE de cada uno.
     *
     * Devuelve SOLO los días con movimiento: el cliente rellena los huecos, que
     * es donde sabe cuántos días pinta. La dominante se resuelve acá y no en el
     * cliente para no mandarle todas las categorías de todos los días.
     */
    @Transactional(readOnly = true)
    public List<DailyTotalDTO> getDailyTotals(LocalDate from, LocalDate to, Long userId, String txType, Long walletId) {
        var rows = "INCOME".equals(txType)
                ? incomeQueries.dailyByCategory(userId, from, to, walletId)
                : expenseQueries.dailyByCategory(userId, from, to, walletId);

        // Por día: suma de todas sus categorías + la de mayor importe.
        Map<LocalDate, BigDecimal> totals = new LinkedHashMap<>();
        Map<LocalDate, DailyCategoryRow> top = new LinkedHashMap<>();
        for (var r : rows) {
            totals.merge(r.getDate(), r.getTotal(), BigDecimal::add);
            var current = top.get(r.getDate());
            if (current == null || r.getTotal().compareTo(current.getTotal()) > 0) {
                top.put(r.getDate(), r);
            }
        }

        return totals.entrySet().stream()
                .map(e -> {
                    var t = top.get(e.getKey());
                    return new DailyTotalDTO(e.getKey(), e.getValue(),
                            t != null ? t.getCategoryName() : null,
                            t != null ? t.getCategoryColor() : null,
                            t != null ? t.getCategoryIcon() : null);
                })
                .toList();
    }
}
