package com.expenses.recurring.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.category.CategoryType;
import com.expenses.expense.ExpenseRequest;
import com.expenses.expense.ExpenseService;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringRepo;
    private final ExpenseService expenseService;
    private final CategoryFinder categoryFinder;
    private final WalletFinder walletFinder;
    private final RecurringExpenseMapper recurringExpenseMapper;

    @Transactional(readOnly = true)
    public List<RecurringExpenseResponse> findAll(Long userId, Long walletId) {
        return recurringRepo.findByUserIdAndOptionalWallet(userId, walletId)
                .stream().map(recurringExpenseMapper::toResponse).toList();
    }

    @Transactional
    public RecurringExpenseResponse create(RecurringExpenseRequest request, Long userId, User user) {
        Category category = categoryFinder.findOwned(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("Los gastos recurrentes solo aplican a categorías de gasto");
        }

        Wallet wallet = walletFinder.findOwned(request.getWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrado"));

        RecurringExpense r = new RecurringExpense();
        r.setUser(user);
        r.setCategory(category);
        r.setWallet(wallet);
        r.setAmount(request.getAmount());
        r.setDescription(request.getDescription());
        r.setFrequency(request.getFrequency());
        r.setStartDate(request.getStartDate());
        r.setNextDate(request.getStartDate());
        r.setActive(true);

        return recurringExpenseMapper.toResponse(recurringRepo.save(r));
    }

    @Transactional
    public RecurringExpenseResponse toggleActive(Long id, Long userId) {
        RecurringExpense r = recurringRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto recurrente no encontrado"));
        r.setActive(!r.isActive());
        return recurringExpenseMapper.toResponse(recurringRepo.save(r));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        recurringRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto recurrente no encontrado"));
        recurringRepo.deleteById(id);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processRecurring() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> due = recurringRepo.findByActiveTrueAndNextDateLessThanEqual(today);

        for (RecurringExpense r : due) {
            ExpenseRequest request = new ExpenseRequest();
            request.setAmount(r.getAmount());
            request.setDate(r.getNextDate());
            request.setCategoryId(r.getCategory().getId());
            request.setWalletId(r.getWallet().getId());
            request.setDescription(r.getDescription() != null
                    ? r.getDescription() + " (automático)"
                    : "Gasto recurrente (automático)");
            expenseService.create(request, r.getUser().getId(), r.getUser());

            r.setNextDate(nextDate(r.getNextDate(), r.getFrequency()));
            recurringRepo.save(r);

            log.info("Gasto recurrente procesado: {} - {}", r.getUser().getUsername(), r.getDescription());
        }
    }

    private LocalDate nextDate(LocalDate current, String frequency) {
        return switch (frequency) {
            case "WEEKLY"  -> current.plusWeeks(1);
            case "YEARLY"  -> current.plusYears(1);
            default        -> current.plusMonths(1); // MONTHLY
        };
    }
}
