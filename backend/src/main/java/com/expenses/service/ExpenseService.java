package com.expenses.service;

import com.expenses.dto.ExpenseDTO;
import com.expenses.entity.Category;
import com.expenses.entity.Expense;
import com.expenses.entity.User;
import com.expenses.entity.Wallet;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.CategoryRepository;
import com.expenses.repository.ExpenseRepository;
import com.expenses.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;

    public Page<ExpenseDTO> findAll(LocalDate from, LocalDate to, Long categoryId, Long walletId, Long userId, Pageable pageable) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();

        Page<Expense> page;
        if (walletId != null && categoryId != null) {
            page = expenseRepository.findByUserIdAndWalletIdAndDateBetweenAndCategoryId(userId, walletId, dateFrom, dateTo, categoryId, pageable);
        } else if (walletId != null) {
            page = expenseRepository.findByUserIdAndWalletIdAndDateBetween(userId, walletId, dateFrom, dateTo, pageable);
        } else if (categoryId != null) {
            page = expenseRepository.findByUserIdAndDateBetweenAndCategoryId(userId, dateFrom, dateTo, categoryId, pageable);
        } else {
            page = expenseRepository.findByUserIdAndDateBetween(userId, dateFrom, dateTo, pageable);
        }
        return page.map(this::toDTO);
    }

    public List<Expense> findAllForExport(LocalDate from, LocalDate to, Long userId) {
        LocalDate dateFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo = to != null ? to : LocalDate.now();
        return expenseRepository.findByUserIdAndDateBetween(userId, dateFrom, dateTo);
    }

    public ExpenseDTO findById(Long id, Long userId) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado: " + id));
    }

    @Transactional
    public ExpenseDTO create(ExpenseDTO dto, Long userId, User user) {
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + dto.getCategoryId()));
        Expense expense = new Expense();
        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        expense.setNotes(dto.getNotes());
        expense.setCategory(category);
        expense.setUser(user);

        if (dto.getWalletId() != null) {
            Wallet wallet = walletRepository.findByIdAndUserId(dto.getWalletId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + dto.getWalletId()));
            expense.setWallet(wallet);
            wallet.setBalance(wallet.getBalance().subtract(dto.getAmount()));
            walletRepository.save(wallet);
        }

        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseDTO update(Long id, ExpenseDTO dto, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado: " + id));
        Category category = categoryRepository.findByIdAndUserId(dto.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + dto.getCategoryId()));

        // Revert old wallet balance
        if (expense.getWallet() != null) {
            Wallet oldWallet = expense.getWallet();
            oldWallet.setBalance(oldWallet.getBalance().add(expense.getAmount()));
            walletRepository.save(oldWallet);
        }

        expense.setAmount(dto.getAmount());
        expense.setDate(dto.getDate());
        expense.setDescription(dto.getDescription());
        expense.setNotes(dto.getNotes());
        expense.setCategory(category);

        // Apply new wallet balance
        if (dto.getWalletId() != null) {
            Wallet newWallet = walletRepository.findByIdAndUserId(dto.getWalletId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + dto.getWalletId()));
            expense.setWallet(newWallet);
            newWallet.setBalance(newWallet.getBalance().subtract(dto.getAmount()));
            walletRepository.save(newWallet);
        } else {
            expense.setWallet(null);
        }

        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado: " + id));

        // Revert wallet balance
        if (expense.getWallet() != null) {
            Wallet wallet = expense.getWallet();
            wallet.setBalance(wallet.getBalance().add(expense.getAmount()));
            walletRepository.save(wallet);
        }

        expenseRepository.deleteById(id);
    }

    private ExpenseDTO toDTO(Expense e) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(e.getId());
        dto.setAmount(e.getAmount());
        dto.setDate(e.getDate());
        dto.setDescription(e.getDescription());
        dto.setNotes(e.getNotes());
        dto.setCategoryId(e.getCategory().getId());
        dto.setCategoryName(e.getCategory().getName());
        dto.setCategoryColor(e.getCategory().getColor());
        dto.setCategoryIcon(e.getCategory().getIcon());
        dto.setAttachmentCount(e.getAttachments().size());
        if (e.getWallet() != null) {
            dto.setWalletId(e.getWallet().getId());
            dto.setWalletName(e.getWallet().getName());
        }
        return dto;
    }
}
