package com.expenses.service;

import com.expenses.dto.IncomeDTO;
import com.expenses.entity.Category;
import com.expenses.entity.CategoryType;
import com.expenses.entity.Income;
import com.expenses.entity.User;
import com.expenses.entity.Wallet;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.IncomeRepository;
import com.expenses.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;

    public Page<IncomeDTO> findAll(LocalDate from, LocalDate to, Long walletId, Long userId, Pageable pageable) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();

        Page<Income> page;
        if (walletId != null) {
            page = incomeRepository.findByUserIdAndWalletIdAndDateBetweenOrderByDateDesc(userId, walletId, dateFrom, dateTo, pageable);
        } else {
            page = incomeRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, dateFrom, dateTo, pageable);
        }
        return page.map(this::toDTO);
    }

    public IncomeDTO findById(Long id, Long userId) {
        return incomeRepository.findByIdAndUserId(id, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + id));
    }

    @Transactional
    public IncomeDTO create(IncomeDTO dto, Long userId, User user) {
        Income income = new Income();
        income.setAmount(dto.getAmount());
        income.setDate(dto.getDate());
        income.setDescription(dto.getDescription());
        income.setNotes(dto.getNotes());
        income.setUser(user);
        income.setCategory(resolveIncomeCategory(dto.getCategoryId(), userId));

        if (dto.getWalletId() != null) {
            Wallet wallet = walletRepository.findByIdAndUserId(dto.getWalletId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + dto.getWalletId()));
            income.setWallet(wallet);
            wallet.setBalance(wallet.getBalance().add(dto.getAmount()));
            walletRepository.save(wallet);
        }

        return toDTO(incomeRepository.save(income));
    }

    @Transactional
    public IncomeDTO update(Long id, IncomeDTO dto, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + id));

        if (income.getWallet() != null) {
            Wallet oldWallet = income.getWallet();
            oldWallet.setBalance(oldWallet.getBalance().subtract(income.getAmount()));
            walletRepository.save(oldWallet);
        }

        income.setAmount(dto.getAmount());
        income.setDate(dto.getDate());
        income.setDescription(dto.getDescription());
        income.setNotes(dto.getNotes());
        income.setCategory(resolveIncomeCategory(dto.getCategoryId(), userId));

        if (dto.getWalletId() != null) {
            Wallet newWallet = walletRepository.findByIdAndUserId(dto.getWalletId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + dto.getWalletId()));
            income.setWallet(newWallet);
            newWallet.setBalance(newWallet.getBalance().add(dto.getAmount()));
            walletRepository.save(newWallet);
        } else {
            income.setWallet(null);
        }

        return toDTO(incomeRepository.save(income));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingreso no encontrado: " + id));

        if (income.getWallet() != null) {
            Wallet wallet = income.getWallet();
            wallet.setBalance(wallet.getBalance().subtract(income.getAmount()));
            walletRepository.save(wallet);
        }

        incomeRepository.delete(income);
    }

    private Category resolveIncomeCategory(Long categoryId, Long userId) {
        if (categoryId == null) return null;
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoryId));
        if (category.getType() != CategoryType.INCOME) {
            throw new IllegalArgumentException("La categoría no es válida para ingresos: " + categoryId);
        }
        return category;
    }

    private IncomeDTO toDTO(Income i) {
        IncomeDTO dto = new IncomeDTO();
        dto.setId(i.getId());
        dto.setAmount(i.getAmount());
        dto.setDate(i.getDate());
        dto.setDescription(i.getDescription());
        dto.setNotes(i.getNotes());
        if (i.getWallet() != null) {
            dto.setWalletId(i.getWallet().getId());
            dto.setWalletName(i.getWallet().getName());
        }
        if (i.getCategory() != null) {
            dto.setCategoryId(i.getCategory().getId());
            dto.setCategoryName(i.getCategory().getName());
            dto.setCategoryColor(i.getCategory().getColor());
            dto.setCategoryIcon(i.getCategory().getIcon());
        }
        return dto;
    }
}
