package com.expenses.shared.query;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Gasto de un día en una categoría; sirve para deducir la dominante. */
public interface DailyCategoryRow {
    LocalDate getDate();
    BigDecimal getTotal();
    String getCategoryName();
    String getCategoryColor();
    String getCategoryIcon();
}
