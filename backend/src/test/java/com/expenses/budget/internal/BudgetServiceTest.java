package com.expenses.budget.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.expense.CategoryWalletSpending;
import com.expenses.expense.ExpenseQueries;
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

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock BudgetRepository budgetRepository;
    @Mock CategoryFinder categoryFinder;
    @Mock WalletFinder walletFinder;
    @Mock ExpenseQueries expenseQueries;
    @Spy BudgetMapper budgetMapper = Mappers.getMapper(BudgetMapper.class);
    @InjectMocks BudgetService budgetService;

    private User user;
    private Wallet wallet;
    private Category catA;
    private Category catB;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("Principal");

        catA = category(1L, "Comida");
        catB = category(2L, "Transporte");
    }

    @Test
    void findAll_usesSingleGroupedQueryInsteadOfOnePerBudget() {
        List<Budget> budgets = List.of(budget(1L, catA, "200.00"), budget(2L, catB, "100.00"));
        when(budgetRepository.findByUserIdAndOptionalWallet(1L, null)).thenReturn(budgets);
        when(expenseQueries.spentInMonthGrouped(eq(1L), anyInt(), anyInt()))
                .thenReturn(List.of(new CategoryWalletSpending(1L, 10L, new BigDecimal("80.00"))));

        List<BudgetResponse> result = budgetService.findAll(1L, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).spent()).isEqualByComparingTo("80.00");
        assertThat(result.get(0).percentage()).isEqualTo(40.0);
        assertThat(result.get(1).spent()).isEqualByComparingTo("0");
        verify(expenseQueries, times(1)).spentInMonthGrouped(eq(1L), anyInt(), anyInt());
        verify(expenseQueries, never()).spentInMonth(anyLong(), anyLong(), anyLong(), anyInt(), anyInt());
    }

    private Budget budget(Long id, Category category, String amount) {
        Budget b = new Budget();
        b.setId(id);
        b.setUser(user);
        b.setCategory(category);
        b.setWallet(wallet);
        b.setAmount(new BigDecimal(amount));
        return b;
    }

    private Category category(Long id, String name) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        c.setColor("#000000");
        c.setIcon("tag");
        return c;
    }
}
