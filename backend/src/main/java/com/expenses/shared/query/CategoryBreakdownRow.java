package com.expenses.shared.query;

import java.math.BigDecimal;

public interface CategoryBreakdownRow {
    String getName();
    BigDecimal getTotal();
    Long getCount();
    String getColor();
    String getIcon();
}
