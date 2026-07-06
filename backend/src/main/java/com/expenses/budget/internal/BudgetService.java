package com.expenses.budget.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.category.CategoryType;
import com.expenses.expense.CategoryWalletSpending;
import com.expenses.expense.ExpenseQueries;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryFinder categoryFinder;
    private final WalletFinder walletFinder;
    private final ExpenseQueries expenseQueries;
    private final BudgetMapper budgetMapper;

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAll(Long userId, Long walletId) {
        List<Budget> budgets = budgetRepository.findByUserIdAndOptionalWallet(userId, walletId);
        LocalDate now = LocalDate.now();
        Map<String, BigDecimal> spentByCategoryWallet = expenseQueries
                .spentInMonthGrouped(userId, now.getMonthValue(), now.getYear())
                .stream()
                .collect(Collectors.toMap(s -> key(s.categoryId(), s.walletId()), CategoryWalletSpending::total));

        return budgets.stream()
                .map(b -> toResponse(b, spentByCategoryWallet.getOrDefault(
                        key(b.getCategory().getId(), b.getWallet().getId()), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public BudgetResponse save(BudgetRequest request, Long userId, User user) {
        Category category = categoryFinder.findOwned(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("Los presupuestos solo aplican a categorías de gasto");
        }

        Wallet wallet = walletFinder.findOwned(request.getWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrado"));

        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndWalletId(userId, request.getCategoryId(), request.getWalletId())
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(category);
        budget.setWallet(wallet);
        budget.setAmount(request.getAmount());

        return toResponse(budgetRepository.save(budget), spentOf(budget, userId));
    }

    @Transactional
    public BudgetResponse update(Long id, BigDecimal amount, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        budget.setAmount(amount);
        return toResponse(budgetRepository.save(budget), spentOf(budget, userId));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        budgetRepository.deleteById(id);
    }

    private BigDecimal spentOf(Budget budget, Long userId) {
        LocalDate now = LocalDate.now();
        return expenseQueries.spentInMonth(
                userId, budget.getCategory().getId(), budget.getWallet().getId(),
                now.getMonthValue(), now.getYear());
    }

    private BudgetResponse toResponse(Budget budget, BigDecimal spent) {
        double pct = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.multiply(BigDecimal.valueOf(100))
                       .divide(budget.getAmount(), 1, RoundingMode.HALF_UP)
                       .doubleValue()
                : 0;
        return budgetMapper.toResponse(budget, spent, Math.min(pct, 100));
    }

    private String key(Long categoryId, Long walletId) {
        return categoryId + ":" + walletId;
    }
}
