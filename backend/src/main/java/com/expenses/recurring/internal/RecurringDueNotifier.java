package com.expenses.recurring.internal;

import com.expenses.recurring.RecurringDueEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
class RecurringDueNotifier {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(RecurringDueEvent event) {
        log.info("Ocurrencia recurrente pendiente generada: occurrence {} (recurrente {}, user {}, vence {}, monto {})",
                event.occurrenceId(), event.recurringId(), event.userId(), event.dueDate(), event.amount());
    }
}
