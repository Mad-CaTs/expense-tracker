package com.expenses.recurring;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringDueEvent(Long occurrenceId, Long recurringId, Long userId,
                                LocalDate dueDate, BigDecimal amount) {
}