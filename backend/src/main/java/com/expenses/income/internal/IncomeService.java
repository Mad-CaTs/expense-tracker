package com.expenses.income.internal;

import com.expenses.category.Category;
import com.expenses.category.CategoryFinder;
import com.expenses.category.CategoryType;
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

import static com.expenses.income.internal.IncomeSpecifications.belongsToUser;
import static com.expenses.income.internal.IncomeSpecifications.dateBetween;
import static com.expenses.income.internal.IncomeSpecifications.hasWallet;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private static final String INCOME_NOT_FOUND = "Ingreso no encontrado: ";

    private final IncomeRepository incomeRepository;
    private final WalletFinder walletFinder;
    private final CategoryFinder categoryFinder;
    private final IncomeMapper incomeMapper;

    @Transactional(readOnly = true)
    public Page<IncomeResponse> findAll(LocalDate from, LocalDate to, Long walletId, Long userId, Pageable pageable) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();

        Specification<Income> spec = belongsToUser(userId)
                .and(dateBetween(dateFrom, dateTo))
                .and(hasWallet(walletId));
        return incomeRepository.findAll(spec, pageable).map(incomeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public IncomeResponse findById(Long id, Long userId) {
        return incomeRepository.findByIdAndUserId(id, userId)
                .map(incomeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_NOT_FOUND + id));
    }

    @Transactional
    public IncomeResponse create(IncomeRequest request, Long userId, User user) {
        Income income = new Income();
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setDescription(request.getDescription());
        income.setNotes(request.getNotes());
        income.setUser(user);
        income.setCategory(resolveIncomeCategory(request.getCategoryId(), userId));

        if (request.getWalletId() != null) {
            income.setWallet(requireWallet(request.getWalletId(), userId));
        }

        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse update(Long id, IncomeRequest request, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_NOT_FOUND + id));

        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setDescription(request.getDescription());
        income.setNotes(request.getNotes());
        income.setCategory(resolveIncomeCategory(request.getCategoryId(), userId));

        if (request.getWalletId() != null) {
            income.setWallet(requireWallet(request.getWalletId(), userId));
        } else {
            income.setWallet(null);
        }

        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(INCOME_NOT_FOUND + id));
        incomeRepository.delete(income);
    }

    private Category resolveIncomeCategory(Long categoryId, Long userId) {
        if (categoryId == null) return null;
        Category category = categoryFinder.findOwned(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
        if (category.getType() != CategoryType.INCOME) {
            throw new BusinessRuleException("La categoría no es válida para ingresos: " + categoryId);
        }
        return category;
    }

    private Wallet requireWallet(Long walletId, Long userId) {
        return walletFinder.findOwned(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + walletId));
    }
}
