package com.expenses.controller;

import com.expenses.dto.ExpenseDTO;
import com.expenses.entity.Category;
import com.expenses.entity.Expense;
import com.expenses.entity.User;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.ExpenseRepository;
import com.expenses.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseControllerTest {

    @Mock ExpenseRepository expenseRepository;
    @Mock CategoryRepository categoryRepository;
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
    void findAll_withUserId_returnsPaginatedResults() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findByUserIdAndDateBetween(eq(1L), any(), any(), any())).thenReturn(page);

        Page<ExpenseDTO> result = expenseService.findAll(null, null, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAmount()).isEqualByComparingTo("25.50");
    }

    @Test
    void findAll_withCategoryFilter_callsCorrectRepository() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findByUserIdAndDateBetweenAndCategoryId(eq(1L), any(), any(), eq(1L), any()))
                .thenReturn(page);

        Page<ExpenseDTO> result = expenseService.findAll(null, null, 1L, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(expenseRepository).findByUserIdAndDateBetweenAndCategoryId(eq(1L), any(), any(), eq(1L), any());
    }

    @Test
    void findAll_withNoResults_returnsEmptyPage() {
        Page<Expense> page = new PageImpl<>(List.of());
        when(expenseRepository.findByUserIdAndDateBetween(eq(1L), any(), any(), any())).thenReturn(page);

        Page<ExpenseDTO> result = expenseService.findAll(null, null, null, 1L, PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
    }
}
