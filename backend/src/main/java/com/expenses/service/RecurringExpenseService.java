package com.expenses.service;

import com.expenses.dto.RecurringExpenseDTO;
import com.expenses.entity.Category;
import com.expenses.entity.Expense;
import com.expenses.entity.RecurringExpense;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.ExpenseRepository;
import com.expenses.repository.RecurringExpenseRepository;
import com.expenses.repository.UserRepository;
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
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<RecurringExpenseDTO> findAll(Long userId) {
        return recurringRepo.findByUserId(userId).stream().map(this::toDTO).toList();
    }

    @Transactional
    public RecurringExpenseDTO create(RecurringExpenseDTO dto, Long userId, User user) {
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        RecurringExpense r = new RecurringExpense();
        r.setUser(user);
        r.setCategory(category);
        r.setAmount(dto.getAmount());
        r.setDescription(dto.getDescription());
        r.setFrequency(dto.getFrequency());
        r.setStartDate(dto.getStartDate());
        r.setNextDate(dto.getStartDate());
        r.setActive(true);

        return toDTO(recurringRepo.save(r));
    }

    @Transactional
    public RecurringExpenseDTO toggleActive(Long id, Long userId) {
        RecurringExpense r = recurringRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto recurrente no encontrado"));
        r.setActive(!r.isActive());
        return toDTO(recurringRepo.save(r));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        recurringRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto recurrente no encontrado"));
        recurringRepo.deleteById(id);
    }

    // Corre todos los días a medianoche
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processRecurring() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> due = recurringRepo.findByActiveTrueAndNextDateLessThanEqual(today);

        for (RecurringExpense r : due) {
            Expense expense = new Expense();
            expense.setUser(r.getUser());
            expense.setCategory(r.getCategory());
            expense.setAmount(r.getAmount());
            expense.setDescription(r.getDescription() != null
                    ? r.getDescription() + " (automático)"
                    : "Gasto recurrente (automático)");
            expense.setDate(r.getNextDate());
            expenseRepository.save(expense);

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

    private RecurringExpenseDTO toDTO(RecurringExpense r) {
        RecurringExpenseDTO dto = new RecurringExpenseDTO();
        dto.setId(r.getId());
        dto.setCategoryId(r.getCategory().getId());
        dto.setCategoryName(r.getCategory().getName());
        dto.setCategoryColor(r.getCategory().getColor());
        dto.setAmount(r.getAmount());
        dto.setDescription(r.getDescription());
        dto.setFrequency(r.getFrequency());
        dto.setStartDate(r.getStartDate());
        dto.setNextDate(r.getNextDate());
        dto.setActive(r.isActive());
        return dto;
    }
}
