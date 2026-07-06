package com.expenses.expense.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.expense.ExpenseRequest;
import com.expenses.expense.ExpenseResponse;
import com.expenses.expense.ExpenseService;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock ExpenseRepository expenseRepository;
    @Mock CategoryFinder categoryFinder;
    @Mock WalletFinder walletFinder;
    @Spy ExpenseMapper expenseMapper = Mappers.getMapper(ExpenseMapper.class);
    @InjectMocks ExpenseService expenseService;

    private Category category;
    private Expense expense;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        category = new Category();
        category.setId(1L);
        category.setName("Comida");
        category.setColor("#EF4444");
        category.setIcon("utensils");
        category.setUser(user);

        expense = new Expense();
        expense.setId(1L);
        expense.setAmount(new BigDecimal("25.50"));
        expense.setDate(LocalDate.now());
        expense.setCategory(category);
        expense.setUser(user);
        expense.setDescription("Almuerzo");
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_delegatesToSpecificationQuery() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ExpenseResponse> result = expenseService.findAll(null, null, null, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).amount()).isEqualByComparingTo("25.50");
        verify(expenseRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void create_withValidData_savesExpense() {
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setCategoryId(1L);
        request.setDescription("Test");

        when(categoryFinder.findOwned(1L, 1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenReturn(expense);

        ExpenseResponse result = expenseService.create(request, 1L, user);
        assertThat(result.id()).isEqualTo(1L);
    }

    @Test
    void create_withInvalidCategory_throwsException() {
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setCategoryId(99L);

        when(categoryFinder.findOwned(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> expenseService.create(request, 1L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_withWallet_assignsOwnedWallet() {
        Wallet wallet = new Wallet();
        wallet.setId(5L);
        wallet.setName("Principal");
        wallet.setInitialBalance(new BigDecimal("100.00"));

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setCategoryId(1L);
        request.setWalletId(5L);

        when(categoryFinder.findOwned(1L, 1L)).thenReturn(Optional.of(category));
        when(walletFinder.findOwned(5L, 1L)).thenReturn(Optional.of(wallet));
        when(expenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ExpenseResponse result = expenseService.create(request, 1L, user);

        assertThat(result.walletId()).isEqualTo(5L);
        assertThat(result.walletName()).isEqualTo("Principal");
    }

    @Test
    void delete_whenNotExists_throwsException() {
        when(expenseRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> expenseService.delete(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_existing_delegatesToRepository() {
        when(expenseRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(expense));

        expenseService.delete(1L, 1L);

        verify(expenseRepository).delete(expense);
    }
}
