package com.expenses.expense.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.expense.ExpenseResponse;
import com.expenses.expense.ExpenseService;
import com.expenses.shared.user.User;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseControllerTest {

    @Mock ExpenseRepository expenseRepository;
    @Mock CategoryFinder categoryFinder;
    @Mock WalletFinder walletFinder;
    @Spy ExpenseMapper expenseMapper = Mappers.getMapper(ExpenseMapper.class);
    @InjectMocks ExpenseService expenseService;

    private Expense expense;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        Category category = new Category();
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
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_withUserId_returnsPaginatedResults() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ExpenseResponse> result = expenseService.findAll(null, null, null, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).amount()).isEqualByComparingTo("25.50");
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_withCategoryFilter_usesSpecificationQuery() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ExpenseResponse> result = expenseService.findAll(null, null, 1L, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(expenseRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_withNoResults_returnsEmptyPage() {
        Page<Expense> page = new PageImpl<>(List.of());
        when(expenseRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ExpenseResponse> result = expenseService.findAll(null, null, null, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
    }
}
