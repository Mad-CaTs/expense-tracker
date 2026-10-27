package com.expenses.savings.internal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PiggyMovementResponse(Long id, PiggyMovementType type, BigDecimal amount, LocalDate date) {
}
