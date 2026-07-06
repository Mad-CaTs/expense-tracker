package com.expenses.report.internal;

import com.expenses.expense.ExpenseQueries;
import com.expenses.income.IncomeQueries;
import com.expenses.income.UncategorizedIncome;
import com.expenses.shared.query.CategoryBreakdownRow;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock ExpenseQueries expenseQueries;
    @Mock IncomeQueries incomeQueries;
    @InjectMocks ReportService reportService;

    @Test
    void getSummary_calculatesChangePercentage() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        when(expenseQueries.sumBetween(1L, from, to)).thenReturn(new BigDecimal("200.00"));
        when(expenseQueries.sumBetween(1L, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 31)))
                .thenReturn(new BigDecimal("100.00"));
        when(incomeQueries.sumBetween(anyLong(), any(), any())).thenReturn(BigDecimal.ZERO);

        ReportSummaryDTO result = reportService.getSummary("MONTHLY", from, to, 1L, null);

        assertThat(result.getCurrentTotal()).isEqualByComparingTo("200.00");
        assertThat(result.getPreviousTotal()).isEqualByComparingTo("100.00");
        assertThat(result.getChangePercentage()).isEqualTo(100.0);
    }

    @Test
    void getCategoryBreakdown_calculatesPercentages() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        when(expenseQueries.breakdown(1L, from, to, null)).thenReturn(List.of(
                row("Comida", "80.00", 3L, "#EF4444", "utensils"),
                row("Transporte", "20.00", 1L, "#3B82F6", "car")));

        List<CategoryBreakdownDTO> result = reportService.getCategoryBreakdown(from, to, 1L, null, "EXPENSE", null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPercentage()).isEqualTo(80.0);
        assertThat(result.get(1).getPercentage()).isEqualTo(20.0);
        assertThat(result.get(0).getType()).isEqualTo("EXPENSE");
    }

    @Test
    void getCategoryBreakdown_incomeType_includesUncategorizedBucket() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        when(incomeQueries.breakdown(1L, from, to, null))
                .thenReturn(List.of(row("Salario", "300.00", 1L, "#10B981", "banknote")));
        when(incomeQueries.uncategorized(1L, from, to, null))
                .thenReturn(new UncategorizedIncome(new BigDecimal("100.00"), 2L));

        List<CategoryBreakdownDTO> result = reportService.getCategoryBreakdown(from, to, 1L, null, "INCOME", null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCategoryName()).isEqualTo("Salario");
        assertThat(result.get(0).getPercentage()).isEqualTo(75.0);
        assertThat(result.get(1).getCategoryName()).isEqualTo("Sin categoría");
        assertThat(result.get(1).getPercentage()).isEqualTo(25.0);
        assertThat(result.get(1).getType()).isEqualTo("INCOME");
    }

    @Test
    void getCategoryBreakdown_incomeType_withoutUncategorized_omitsBucket() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        when(incomeQueries.breakdown(1L, from, to, null))
                .thenReturn(List.of(row("Salario", "300.00", 1L, "#10B981", "banknote")));
        when(incomeQueries.uncategorized(1L, from, to, null))
                .thenReturn(new UncategorizedIncome(BigDecimal.ZERO, 0L));

        List<CategoryBreakdownDTO> result = reportService.getCategoryBreakdown(from, to, 1L, null, "INCOME", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPercentage()).isEqualTo(100.0);
    }

    private CategoryBreakdownRow row(String name, String total, Long count, String color, String icon) {
        return new CategoryBreakdownRow() {
            @Override public String getName() { return name; }
            @Override public BigDecimal getTotal() { return new BigDecimal(total); }
            @Override public Long getCount() { return count; }
            @Override public String getColor() { return color; }
            @Override public String getIcon() { return icon; }
        };
    }
}
