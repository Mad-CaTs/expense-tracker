package com.expenses.income.internal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class IncomeMapperTest {

    private final IncomeMapper mapper = Mappers.getMapper(IncomeMapper.class);

    @Test
    @DisplayName("expone createdAt: es el único desempate válido frente a gastos, "
            + "que tienen su propia secuencia de ids")
    void mapsCreatedAt() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 8, 20, 5, 58, 55);
        Income income = incomeWith(createdAt);

        IncomeResponse response = mapper.toResponse(income);

        assertThat(response.createdAt()).isEqualTo(createdAt);
    }

    @Test
    @DisplayName("createdAt nulo no rompe el mapeo: filas antiguas pueden no tenerlo")
    void mapsNullCreatedAt() {
        IncomeResponse response = mapper.toResponse(incomeWith(null));

        assertThat(response.createdAt()).isNull();
        assertThat(response.id()).isEqualTo(21L);
    }

    private Income incomeWith(LocalDateTime createdAt) {
        Income income = new Income();
        income.setId(21L);
        income.setAmount(new BigDecimal("100.00"));
        income.setDescription("Ingreso");
        income.setDate(LocalDate.of(2026, 8, 20));
        income.setCreatedAt(createdAt);
        return income;
    }
}
