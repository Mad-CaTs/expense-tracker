package com.expenses.service;

import com.expenses.dto.CategoryBreakdownDTO;
import com.expenses.dto.ReportSummaryDTO;
import com.expenses.repository.ExpenseRepository;
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

    @Mock ExpenseRepository expenseRepository;
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

        ReportSummaryDTO result = reportService.getSummary("MONTHLY", from, to, 1L);

        assertThat(result.getCurrentTotal()).isEqualByComparingTo("200.00");
        assertThat(result.getPreviousTotal()).isEqualByComparingTo("100.00");
        assertThat(result.getChangePercentage()).isEqualTo(100.0);
    }

    @Test
    void getCategoryBreakdown_calculatesPercentages() {
        LocalDate from = LocalDate.of(2026, 4, 1);
        LocalDate to = LocalDate.of(2026, 4, 30);

        List<Object[]> raw = List.of(
            new Object[]{"Comida", new BigDecimal("80.00"), 3L},
            new Object[]{"Transporte", new BigDecimal("20.00"), 1L}
        );
        when(expenseRepository.findCategoryBreakdownByUserId(1L, from, to)).thenReturn(raw);

        List<CategoryBreakdownDTO> result = reportService.getCategoryBreakdown(from, to, 1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPercentage()).isEqualTo(80.0);
        assertThat(result.get(1).getPercentage()).isEqualTo(20.0);
    }
}
