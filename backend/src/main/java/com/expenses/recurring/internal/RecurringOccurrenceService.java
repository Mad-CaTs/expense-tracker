package com.expenses.recurring.internal;

import com.expenses.expense.ExpenseRequest;
import com.expenses.expense.ExpenseResponse;
import com.expenses.expense.ExpenseService;
import com.expenses.recurring.RecurringDueEvent;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringOccurrenceService {

    private final RecurringOccurrenceRepository occurrenceRepository;
    private final RecurringExpenseRepository recurringRepository;
    private final ExpenseService expenseService;
    private final RecurringOccurrenceMapper occurrenceMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<OccurrenceResponse> findPending(Long userId) {
        return occurrenceRepository.findByUserIdAndStatusOrderByDueDateAsc(userId, OccurrenceStatus.PENDING)
                .stream().map(occurrenceMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OccurrenceResponse> history(Long recurringId, Long userId) {
        return occurrenceRepository.findByUserIdAndRecurringIdOrderByDueDateDesc(userId, recurringId)
                .stream().map(occurrenceMapper::toResponse).toList();
    }

    @Transactional
    public OccurrenceResponse confirm(Long occurrenceId, Long userId) {
        RecurringOccurrence occurrence = requireOccurrence(occurrenceId, userId);
        if (occurrence.getStatus() != OccurrenceStatus.PENDING) {
            throw new BusinessRuleException("Solo se puede confirmar una ocurrencia pendiente");
        }
        return markPaid(occurrence, userId);
    }

    @Transactional
    public OccurrenceResponse reject(Long occurrenceId, Long userId) {
        RecurringOccurrence occurrence = requireOccurrence(occurrenceId, userId);
        if (occurrence.getStatus() != OccurrenceStatus.PENDING) {
            throw new BusinessRuleException("Solo se puede rechazar una ocurrencia pendiente");
        }
        occurrence.setStatus(OccurrenceStatus.SKIPPED);
        return occurrenceMapper.toResponse(occurrenceRepository.save(occurrence));
    }

    @Transactional
    public OccurrenceResponse payDebt(Long occurrenceId, Long userId) {
        RecurringOccurrence occurrence = requireOccurrence(occurrenceId, userId);
        if (occurrence.getStatus() != OccurrenceStatus.SKIPPED) {
            throw new BusinessRuleException("Solo se puede pagar la deuda de una ocurrencia omitida");
        }
        return markPaid(occurrence, userId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateFor(Long recurringId, LocalDate today) {
        RecurringExpense recurring = recurringRepository.findById(recurringId).orElse(null);
        if (recurring == null || !recurring.isActive() || recurring.getNextDate().isAfter(today)) {
            return;
        }

        RecurringOccurrence occurrence = new RecurringOccurrence();
        occurrence.setRecurring(recurring);
        occurrence.setUserId(recurring.getUser().getId());
        occurrence.setDueDate(recurring.getNextDate());
        occurrence.setAmount(recurring.getAmount());
        occurrence.setStatus(OccurrenceStatus.PENDING);
        occurrence = occurrenceRepository.saveAndFlush(occurrence);

        recurring.setNextDate(nextDate(recurring.getNextDate(), recurring.getFrequency()));
        recurringRepository.save(recurring);

        eventPublisher.publishEvent(new RecurringDueEvent(occurrence.getId(), recurring.getId(),
                occurrence.getUserId(), occurrence.getDueDate(), occurrence.getAmount()));
    }

    static LocalDate nextDate(LocalDate current, String frequency) {
        return switch (frequency) {
            case "WEEKLY"  -> current.plusWeeks(1);
            case "YEARLY"  -> current.plusYears(1);
            default        -> current.plusMonths(1);
        };
    }

    private OccurrenceResponse markPaid(RecurringOccurrence occurrence, Long userId) {
        if (occurrence.getAmount() == null || occurrence.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("El monto de la ocurrencia no es válido");
        }
        RecurringExpense recurring = occurrence.getRecurring();
        if (recurring == null || recurring.getCategory() == null || recurring.getWallet() == null) {
            throw new BusinessRuleException(
                    "El gasto recurrente ya no existe; registra el gasto manualmente");
        }

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(occurrence.getAmount());
        request.setDate(LocalDate.now());
        request.setCategoryId(recurring.getCategory().getId());
        request.setWalletId(recurring.getWallet().getId());
        request.setDescription(recurring.getDescription() != null
                ? recurring.getDescription()
                : "Gasto recurrente");

        ExpenseResponse expense = expenseService.create(request, userId, recurring.getUser());

        occurrence.setExpenseId(expense.id());
        occurrence.setStatus(OccurrenceStatus.PAID);
        log.info("Ocurrencia {} pagada por user {}: expense {} con fecha {}",
                occurrence.getId(), userId, expense.id(), expense.date());
        return occurrenceMapper.toResponse(occurrenceRepository.save(occurrence));
    }

    private RecurringOccurrence requireOccurrence(Long occurrenceId, Long userId) {
        return occurrenceRepository.findByIdAndUserId(occurrenceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ocurrencia no encontrada: " + occurrenceId));
    }
}
