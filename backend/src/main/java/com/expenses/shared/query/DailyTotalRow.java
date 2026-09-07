package com.expenses.shared.query;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Total de un día concreto; alimenta el ritmo del periodo en /reports. */
public interface DailyTotalRow {
    LocalDate getDate();
    BigDecimal getTotal();
}
