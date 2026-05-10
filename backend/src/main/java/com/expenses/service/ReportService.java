package com.expenses.service;

import com.expenses.dto.CategoryBreakdownDTO;
import com.expenses.dto.ReportSummaryDTO;
import com.expenses.repository.ExpenseRepository;
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

    public ReportSummaryDTO getSummary(String period, LocalDate from, LocalDate to, Long userId) {
        LocalDate[] prev = previousPeriod(period, from, to);
        LocalDate prevFrom = prev[0];
        LocalDate prevTo = prev[1];

        BigDecimal current = expenseRepository.sumAmountByUserIdAndDateBetween(userId, from, to);
        BigDecimal previous = expenseRepository.sumAmountByUserIdAndDateBetween(userId, prevFrom, prevTo);

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
        return dto;
    }

    public List<CategoryBreakdownDTO> getCategoryBreakdown(LocalDate from, LocalDate to, Long userId) {
        List<Object[]> raw = expenseRepository.findCategoryBreakdownByUserId(userId, from, to);
        BigDecimal total = raw.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return raw.stream().map(r -> {
            String name = (String) r[0];
            BigDecimal amount = (BigDecimal) r[1];
            Long count = (Long) r[2];
            double pct = total.compareTo(BigDecimal.ZERO) != 0
                    ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            return new CategoryBreakdownDTO(name, amount, pct, count);
        }).toList();
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
            default -> {
                long days = ChronoUnit.DAYS.between(from, to) + 1;
                yield new LocalDate[]{ from.minusDays(days), to.minusDays(days) };
            }
        };
    }
}
