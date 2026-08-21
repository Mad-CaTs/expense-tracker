package com.expenses.expense.internal;

import com.expenses.expense.ExpenseResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ExpenseMapperTest {

    private final ExpenseMapper mapper = Mappers.getMapper(ExpenseMapper.class);

    @Test
    @DisplayName("expone createdAt: es el único desempate válido frente a ingresos, "
            + "que tienen su propia secuencia de ids")
    void mapsCreatedAt() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 8, 20, 5, 58, 47);
        Expense expense = expenseWith(createdAt);

        ExpenseResponse response = mapper.toResponse(expense);

        assertThat(response.createdAt()).isEqualTo(createdAt);
    }

    @Test
    @DisplayName("createdAt nulo no rompe el mapeo: filas antiguas pueden no tenerlo")
    void mapsNullCreatedAt() {
        ExpenseResponse response = mapper.toResponse(expenseWith(null));

        assertThat(response.createdAt()).isNull();
        assertThat(response.id()).isEqualTo(135L);
    }

    private Expense expenseWith(LocalDateTime createdAt) {
        Expense expense = new Expense();
        expense.setId(135L);
        expense.setAmount(new BigDecimal("200.00"));
        expense.setDescription("Gasto");
        expense.setDate(LocalDate.of(2026, 8, 20));
        expense.setCreatedAt(createdAt);
        return expense;
    }
}
