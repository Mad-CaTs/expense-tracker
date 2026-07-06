package com.expenses.income;

import java.math.BigDecimal;

public record UncategorizedIncome(BigDecimal total, long count) {
}
