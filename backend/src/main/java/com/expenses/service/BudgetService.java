package com.expenses.service;

import com.expenses.dto.BudgetDTO;
import com.expenses.entity.Budget;
import com.expenses.entity.Category;
import com.expenses.entity.User;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.BudgetRepository;
import com.expenses.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;

    public List<BudgetDTO> findByPeriod(Integer month, Integer year, Long userId) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .stream()
                .map(b -> toDTO(b, userId))
                .toList();
    }

    @Transactional
    public BudgetDTO save(BudgetDTO dto, Long userId, User user) {
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        // Upsert: si ya existe para ese mes/año/categoría, actualiza
        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndMonthAndYear(userId, dto.getCategoryId(), dto.getMonth(), dto.getYear())
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(category);
        budget.setAmount(dto.getAmount());
        budget.setMonth(dto.getMonth());
        budget.setYear(dto.getYear());
        budget.setUpdatedAt(java.time.LocalDateTime.now());

        return toDTO(budgetRepository.save(budget), userId);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        budgetRepository.deleteById(id);
    }

    private BudgetDTO toDTO(Budget b, Long userId) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(b.getId());
        dto.setCategoryId(b.getCategory().getId());
        dto.setCategoryName(b.getCategory().getName());
        dto.setCategoryColor(b.getCategory().getColor());
        dto.setCategoryIcon(b.getCategory().getIcon());
        dto.setAmount(b.getAmount());
        dto.setMonth(b.getMonth());
        dto.setYear(b.getYear());

        BigDecimal spent = budgetRepository.sumSpentByCategoryAndPeriod(
                userId, b.getCategory().getId(), b.getMonth(), b.getYear());
        dto.setSpent(spent);

        double pct = b.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.multiply(BigDecimal.valueOf(100))
                       .divide(b.getAmount(), 1, RoundingMode.HALF_UP)
                       .doubleValue()
                : 0;
        dto.setPercentage(Math.min(pct, 100));

        return dto;
    }
}
