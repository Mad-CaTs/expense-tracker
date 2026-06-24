package com.expenses.service;

import com.expenses.dto.WalletDTO;
import com.expenses.entity.User;
import com.expenses.entity.Wallet;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.entity.CardBackground;
import com.expenses.repository.CardBackgroundRepository;
import com.expenses.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final CardBackgroundRepository cardBackgroundRepository;

    public List<WalletDTO> findAll(Long userId) {
        return walletRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream().map(this::toDTO).toList();
    }

    public WalletDTO findById(Long id, Long userId) {
        return walletRepository.findByIdAndUserId(id, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + id));
    }

    @Transactional
    public WalletDTO create(WalletDTO dto, User user) {
        Wallet wallet = new Wallet();
        wallet.setName(dto.getName());
        wallet.setInitialBalance(dto.getInitialBalance());
        wallet.setBalance(dto.getInitialBalance());
        wallet.setColor(dto.getColor());
        wallet.setIcon(dto.getIcon());
        wallet.setUser(user);
        applyBackground(wallet, dto.getBackgroundId());
        return toDTO(walletRepository.save(wallet));
    }

    @Transactional
    public WalletDTO update(Long id, WalletDTO dto, Long userId) {
        Wallet wallet = walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + id));
        wallet.setName(dto.getName());
        wallet.setColor(dto.getColor());
        wallet.setIcon(dto.getIcon());
        applyBackground(wallet, dto.getBackgroundId());
        return toDTO(walletRepository.save(wallet));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Wallet wallet = walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + id));
        walletRepository.delete(wallet);
    }

    public WalletDTO toDTO(Wallet w) {
        WalletDTO dto = new WalletDTO();
        dto.setId(w.getId());
        dto.setName(w.getName());
        dto.setInitialBalance(w.getInitialBalance());
        dto.setBalance(w.getBalance());
        dto.setColor(w.getColor());
        dto.setIcon(w.getIcon());
        if (w.getBackground() != null) {
            dto.setBackgroundId(w.getBackground().getId());
            dto.setBackgroundUrl(w.getBackground().getImageUrl());
        }
        return dto;
    }

    private void applyBackground(Wallet wallet, Long backgroundId) {
        if (backgroundId == null) {
            wallet.setBackground(null);
        } else {
            CardBackground bg = cardBackgroundRepository.findById(backgroundId)
                    .orElseThrow(() -> new ResourceNotFoundException("Fondo no encontrado: " + backgroundId));
            wallet.setBackground(bg);
        }
    }
}
