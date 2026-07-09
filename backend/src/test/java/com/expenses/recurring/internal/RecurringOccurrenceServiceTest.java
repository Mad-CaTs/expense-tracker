package com.expenses.recurring.internal;

import com.expenses.category.Category;
import com.expenses.expense.ExpenseRequest;
import com.expenses.expense.ExpenseResponse;
import com.expenses.expense.ExpenseService;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringOccurrenceServiceTest {

    @Mock RecurringOccurrenceRepository occurrenceRepository;
    @Mock RecurringExpenseRepository recurringRepository;
    @Mock ExpenseService expenseService;
    @Mock ApplicationEventPublisher eventPublisher;
    @Spy RecurringOccurrenceMapper occurrenceMapper = Mappers.getMapper(RecurringOccurrenceMapper.class);
    @InjectMocks RecurringOccurrenceService occurrenceService;

    private User user;
    private RecurringExpense recurring;
    private RecurringOccurrence occurrence;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        Category category = new Category();
        category.setId(3L);
        category.setName("Suscripciones");
        category.setColor("#8B5CF6");
        category.setIcon("film");

        Wallet wallet = new Wallet();
        wallet.setId(7L);
        wallet.setName("Principal");

        recurring = new RecurringExpense();
        recurring.setId(20L);
        recurring.setUser(user);
        recurring.setCategory(category);
        recurring.setWallet(wallet);
        recurring.setAmount(new BigDecimal("45.00"));
        recurring.setDescription("Netflix");
        recurring.setFrequency("MONTHLY");
        recurring.setActive(true);

        occurrence = new RecurringOccurrence();
        occurrence.setId(100L);
        occurrence.setRecurring(recurring);
        occurrence.setUserId(1L);
        occurrence.setDueDate(LocalDate.now().minusMonths(2));
        occurrence.setAmount(new BigDecimal("45.00"));
        occurrence.setStatus(OccurrenceStatus.PENDING);
    }

    @Test
    void confirm_pending_createsExpenseDatedTodayNotDueDate() {
        when(occurrenceRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(occurrence));
        when(expenseService.create(any(), eq(1L), eq(user))).thenReturn(expenseResponse(55L));
        when(occurrenceRepository.save(occurrence)).thenReturn(occurrence);

        OccurrenceResponse result = occurrenceService.confirm(100L, 1L);

        ArgumentCaptor<ExpenseRequest> captor = ArgumentCaptor.forClass(ExpenseRequest.class);
        verify(expenseService).create(captor.capture(), eq(1L), eq(user));
        assertThat(captor.getValue().getDate()).isEqualTo(LocalDate.now());
        assertThat(captor.getValue().getDate()).isNotEqualTo(occurrence.getDueDate());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("45.00");
        assertThat(captor.getValue().getCategoryId()).isEqualTo(3L);
        assertThat(captor.getValue().getWalletId()).isEqualTo(7L);

        assertThat(result.status()).isEqualTo("PAID");
        assertThat(result.expenseId()).isEqualTo(55L);
    }

    @Test
    void confirm_alreadyPaid_throwsWithoutCreatingExpense() {
        occurrence.setStatus(OccurrenceStatus.PAID);
        when(occurrenceRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(occurrence));

        assertThatThrownBy(() -> occurrenceService.confirm(100L, 1L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("pendiente");
        verifyNoInteractions(expenseService);
    }

    @Test
    void reject_pending_marksSkippedWithoutExpense() {
        when(occurrenceRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(occurrence));
        when(occurrenceRepository.save(occurrence)).thenReturn(occurrence);

        OccurrenceResponse result = occurrenceService.reject(100L, 1L);

        assertThat(result.status()).isEqualTo("SKIPPED");
        assertThat(result.expenseId()).isNull();
        verifyNoInteractions(expenseService);
    }

    @Test
    void payDebt_skipped_createsExpenseDatedToday() {
        occurrence.setStatus(OccurrenceStatus.SKIPPED);
        when(occurrenceRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(occurrence));
        when(expenseService.create(any(), eq(1L), eq(user))).thenReturn(expenseResponse(56L));
        when(occurrenceRepository.save(occurrence)).thenReturn(occurrence);

        OccurrenceResponse result = occurrenceService.payDebt(100L, 1L);

        ArgumentCaptor<ExpenseRequest> captor = ArgumentCaptor.forClass(ExpenseRequest.class);
        verify(expenseService).create(captor.capture(), eq(1L), eq(user));
        assertThat(captor.getValue().getDate()).isEqualTo(LocalDate.now());
        assertThat(result.status()).isEqualTo("PAID");
        assertThat(result.expenseId()).isEqualTo(56L);
    }

    @Test
    void payDebt_onPendingOrPaid_throws() {
        when(occurrenceRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(occurrence));
        assertThatThrownBy(() -> occurrenceService.payDebt(100L, 1L))
                .isInstanceOf(BusinessRuleException.class);

        occurrence.setStatus(OccurrenceStatus.PAID);
        assertThatThrownBy(() -> occurrenceService.payDebt(100L, 1L))
                .isInstanceOf(BusinessRuleException.class);
        verifyNoInteractions(expenseService);
    }

    @Test
    void generateFor_dueRecurring_createsPendingSnapshotAndAdvancesNextDate() {
        LocalDate due = LocalDate.now();
        recurring.setNextDate(due);
        when(recurringRepository.findById(20L)).thenReturn(Optional.of(recurring));
        when(occurrenceRepository.saveAndFlush(any())).thenAnswer(inv -> {
            RecurringOccurrence saved = inv.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        occurrenceService.generateFor(20L, due);

        ArgumentCaptor<RecurringOccurrence> captor = ArgumentCaptor.forClass(RecurringOccurrence.class);
        verify(occurrenceRepository).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(OccurrenceStatus.PENDING);
        assertThat(captor.getValue().getDueDate()).isEqualTo(due);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("45.00");
        assertThat(recurring.getNextDate()).isEqualTo(due.plusMonths(1));
        verify(eventPublisher).publishEvent(any(com.expenses.recurring.RecurringDueEvent.class));
        verifyNoInteractions(expenseService);
    }

    @Test
    void generateFor_inactiveOrNotDue_doesNothing() {
        recurring.setActive(false);
        recurring.setNextDate(LocalDate.now());
        when(recurringRepository.findById(20L)).thenReturn(Optional.of(recurring));

        occurrenceService.generateFor(20L, LocalDate.now());

        verify(occurrenceRepository, never()).saveAndFlush(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    private ExpenseResponse expenseResponse(Long id) {
        return new ExpenseResponse(id, new BigDecimal("45.00"), "Netflix", LocalDate.now(),
                3L, null, "Suscripciones", "#8B5CF6", "film", 0, 7L, "Principal");
    }
}
