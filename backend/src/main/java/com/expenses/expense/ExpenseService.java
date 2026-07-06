package com.expenses.expense;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.category.CategoryType;
import com.expenses.expense.internal.Expense;
import com.expenses.expense.internal.ExpenseMapper;
import com.expenses.expense.internal.ExpenseRepository;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static com.expenses.expense.internal.ExpenseSpecifications.belongsToUser;
import static com.expenses.expense.internal.ExpenseSpecifications.dateBetween;
import static com.expenses.expense.internal.ExpenseSpecifications.hasCategory;
import static com.expenses.expense.internal.ExpenseSpecifications.hasWallet;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private static final String EXPENSE_NOT_FOUND = "Gasto no encontrado: ";

    private final ExpenseRepository expenseRepository;
    private final CategoryFinder categoryFinder;
    private final WalletFinder walletFinder;
    private final ExpenseMapper expenseMapper;

    @Transactional(readOnly = true)
    public Page<ExpenseResponse> findAll(LocalDate from, LocalDate to, Long categoryId, Long walletId, Long userId, Pageable pageable) {
        return expenseRepository.findAll(filterSpec(from, to, categoryId, walletId, userId), pageable)
                .map(expenseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<Expense> findAllForExport(LocalDate from, LocalDate to, Long userId) {
        return expenseRepository.findAll(filterSpec(from, to, null, null, userId));
    }

    @Transactional(readOnly = true)
    public ExpenseResponse findById(Long id, Long userId) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .map(expenseMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(EXPENSE_NOT_FOUND + id));
    }

    @Transactional
    public ExpenseResponse create(ExpenseRequest request, Long userId, User user) {
        Category category = requireExpenseCategory(request.getCategoryId(), userId);
        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setNotes(request.getNotes());
        expense.setCategory(category);
        expense.setUser(user);

        if (request.getWalletId() != null) {
            expense.setWallet(requireWallet(request.getWalletId(), userId));
        }

        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(Long id, ExpenseRequest request, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(EXPENSE_NOT_FOUND + id));
        Category category = requireExpenseCategory(request.getCategoryId(), userId);

        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setNotes(request.getNotes());
        expense.setCategory(category);

        if (request.getWalletId() != null) {
            expense.setWallet(requireWallet(request.getWalletId(), userId));
        } else {
            expense.setWallet(null);
        }

        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(EXPENSE_NOT_FOUND + id));
        expenseRepository.delete(expense);
    }

    private Specification<Expense> filterSpec(LocalDate from, LocalDate to, Long categoryId, Long walletId, Long userId) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();
        return belongsToUser(userId)
                .and(dateBetween(dateFrom, dateTo))
                .and(hasCategory(categoryId))
                .and(hasWallet(walletId));
    }

    private Category requireExpenseCategory(Long categoryId, Long userId) {
        Category category = categoryFinder.findOwned(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("La categoría no es válida para gastos: " + category.getId());
        }
        return category;
    }

    private Wallet requireWallet(Long walletId, Long userId) {
        return walletFinder.findOwned(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + walletId));
    }
}
