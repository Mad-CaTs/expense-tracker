package com.expenses.service;

import com.expenses.dto.BudgetDTO;
import com.expenses.entity.Budget;
import com.expenses.entity.Category;
import com.expenses.entity.CategoryType;
import com.expenses.entity.User;
import com.expenses.entity.Wallet;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.BudgetRepository;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;

    public List<BudgetDTO> findAll(Long userId, Long walletId) {
        return budgetRepository.findByUserIdAndOptionalWallet(userId, walletId)
                .stream()
                .map(b -> toDTO(b, userId))
                .toList();
    }

    @Transactional
    public BudgetDTO save(BudgetDTO dto, Long userId, User user) {
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        if (category.getType() != CategoryType.EXPENSE) {
            throw new IllegalArgumentException("Los presupuestos solo aplican a categorías de gasto");
        }

        Wallet wallet = walletRepository.findByIdAndUserId(dto.getWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrado"));

        // Upsert: si ya existe para esa categoría/wallet, actualiza
        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndWalletId(userId, dto.getCategoryId(), dto.getWalletId())
                .orElse(new Budget());

        budget.setUser(user);
        budget.setCategory(category);
        budget.setWallet(wallet);
        budget.setAmount(dto.getAmount());
        budget.setUpdatedAt(java.time.LocalDateTime.now());

        return toDTO(budgetRepository.save(budget), userId);
    }

    @Transactional
    public BudgetDTO update(Long id, BigDecimal amount, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        budget.setAmount(amount);
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
        dto.setWalletId(b.getWallet().getId());
        dto.setWalletName(b.getWallet().getName());
        dto.setAmount(b.getAmount());

        // Gastado del mes actual, filtrado por categoría y wallet
        LocalDate now = LocalDate.now();
        BigDecimal spent = budgetRepository.sumSpentByCategoryWalletAndPeriod(
                userId, b.getCategory().getId(), b.getWallet().getId(),
                now.getMonthValue(), now.getYear());
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
