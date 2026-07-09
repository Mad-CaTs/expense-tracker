package com.expenses.recurring.internal;

import com.expenses.category.CategoryFinder;
import com.expenses.shared.user.User;
import com.expenses.wallet.WalletFinder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringSchedulerTest {

    @Mock RecurringExpenseRepository recurringRepo;
    @Mock RecurringOccurrenceRepository occurrenceRepository;
    @Mock RecurringOccurrenceService occurrenceService;
    @Mock CategoryFinder categoryFinder;
    @Mock WalletFinder walletFinder;
    @Spy RecurringExpenseMapper recurringExpenseMapper = Mappers.getMapper(RecurringExpenseMapper.class);
    @InjectMocks RecurringExpenseService recurringExpenseService;

    @Test
    void generateDueOccurrences_duplicateDoesNotAbortBatch() {
        RecurringExpense first = recurringWithId(1L);
        RecurringExpense second = recurringWithId(2L);
        when(recurringRepo.findByActiveTrueAndNextDateLessThanEqual(any()))
                .thenReturn(List.of(first, second));
        doThrow(new DataIntegrityViolationException("duplicate key"))
                .when(occurrenceService).generateFor(eq(1L), any(LocalDate.class));

        recurringExpenseService.generateDueOccurrences();

        verify(occurrenceService).generateFor(eq(1L), any(LocalDate.class));
        verify(occurrenceService).generateFor(eq(2L), any(LocalDate.class));
    }

    @Test
    void delete_skipsPendingOccurrencesBeforeSoftDelete() {
        RecurringExpense recurring = recurringWithId(9L);
        when(recurringRepo.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(recurring));

        recurringExpenseService.delete(9L, 1L);

        verify(occurrenceRepository).skipPendingByRecurringId(eq(9L), eq(1L), any(LocalDateTime.class));
        verify(recurringRepo).deleteById(9L);
    }

    private RecurringExpense recurringWithId(Long id) {
        User user = new User();
        user.setId(1L);
        RecurringExpense r = new RecurringExpense();
        r.setId(id);
        r.setUser(user);
        r.setAmount(new BigDecimal("10.00"));
        r.setFrequency("MONTHLY");
        r.setNextDate(LocalDate.now());
        r.setActive(true);
        return r;
    }
}
