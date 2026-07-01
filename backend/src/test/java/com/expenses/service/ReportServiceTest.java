package com.expenses.service;

import com.expenses.dto.CategoryBreakdownDTO;
import com.expenses.dto.ReportSummaryDTO;
import com.expenses.repository.ExpenseRepository;
import com.expenses.repository.IncomeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock ExpenseRepository expenseRepository;
    @Mock IncomeRepository incomeRepository;
    @InjectMocks ReportService reportService;

    @Test
    void getSummary_calculatesChangePercentage() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        when(expenseRepository.sumAmountByUserIdAndDateBetween(1L, from, to))
                .thenReturn(new BigDecimal("200.00"));
        when(expenseRepository.sumAmountByUserIdAndDateBetween(
                1L, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 31)))
                .thenReturn(new BigDecimal("100.00"));
        when(incomeRepository.sumAmountByUserIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(BigDecimal.ZERO);

        ReportSummaryDTO result = reportService.getSummary("MONTHLY", from, to, 1L, null);

        assertThat(result.getCurrentTotal()).isEqualByComparingTo("200.00");
        assertThat(result.getPreviousTotal()).isEqualByComparingTo("100.00");
        assertThat(result.getChangePercentage()).isEqualTo(100.0);
    }

    @Test
    void getCategoryBreakdown_calculatesPercentages() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        List<Object[]> raw = List.of(
            new Object[]{"Comida", new BigDecimal("80.00"), 3L, "#EF4444", "utensils"},
            new Object[]{"Transporte", new BigDecimal("20.00"), 1L, "#3B82F6", "car"}
        );
        when(expenseRepository.findCategoryBreakdownByUserId(1L, from, to, (Long) null)).thenReturn(raw);

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

        List<Object[]> raw = Collections.singletonList(
            new Object[]{"Salario", new BigDecimal("300.00"), 1L, "#10B981", "banknote"}
        );
        when(incomeRepository.findCategoryBreakdownByUserId(1L, from, to, (Long) null)).thenReturn(raw);
        when(incomeRepository.findUncategorizedTotals(1L, from, to, (Long) null))
                .thenReturn(Collections.singletonList(new Object[]{new BigDecimal("100.00"), 2L}));

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

        List<Object[]> raw = Collections.singletonList(
            new Object[]{"Salario", new BigDecimal("300.00"), 1L, "#10B981", "banknote"}
        );
        when(incomeRepository.findCategoryBreakdownByUserId(1L, from, to, (Long) null)).thenReturn(raw);
        when(incomeRepository.findUncategorizedTotals(1L, from, to, (Long) null))
                .thenReturn(Collections.singletonList(new Object[]{BigDecimal.ZERO, 0L}));

        List<CategoryBreakdownDTO> result = reportService.getCategoryBreakdown(from, to, 1L, null, "INCOME", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPercentage()).isEqualTo(100.0);
    }
}
