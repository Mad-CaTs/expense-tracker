package com.expenses.service;

import com.expenses.dto.ExpenseDTO;
import com.expenses.entity.Category;
import com.expenses.entity.Expense;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.ExpenseRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock ExpenseRepository expenseRepository;
    @Mock CategoryRepository categoryRepository;
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
    void findAll_returnsPaginatedResults() {
        Page<Expense> page = new PageImpl<>(List.of(expense));
        when(expenseRepository.findByUserIdAndDateBetween(eq(1L), any(), any(), any())).thenReturn(page);
        var result = expenseService.findAll(null, null, null, 1L, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getAmount()).isEqualByComparingTo("25.50");
    }

    @Test
    void create_withValidData_savesExpense() {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setAmount(new BigDecimal("50.00"));
        dto.setDate(LocalDate.now());
        dto.setCategoryId(1L);
        dto.setDescription("Test");

        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        when(expenseRepository.save(any())).thenReturn(expense);

        ExpenseDTO result = expenseService.create(dto, 1L, user);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void create_withInvalidCategory_throwsException() {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setAmount(new BigDecimal("50.00"));
        dto.setDate(LocalDate.now());
        dto.setCategoryId(99L);

        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> expenseService.create(dto, 1L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_whenNotExists_throwsException() {
        when(expenseRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> expenseService.delete(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
