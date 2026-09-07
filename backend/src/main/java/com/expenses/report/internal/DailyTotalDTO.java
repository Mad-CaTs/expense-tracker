package com.expenses.report.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Un día del periodo con su total y la categoría DOMINANTE: aquella en la que
 * más se movió ese día. El calendario de /reports pinta su icono.
 */
public record DailyTotalDTO(
        LocalDate date,
        BigDecimal total,
        String categoryName,
        String categoryColor,
        String categoryIcon) {
}
