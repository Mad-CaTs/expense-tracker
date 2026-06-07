package com.expenses.service;

import com.expenses.dto.TransferDTO;
import com.expenses.entity.Transfer;
import com.expenses.entity.User;
import com.expenses.entity.Wallet;
import com.expenses.exception.ResourceNotFoundException;
import com.expenses.repository.TransferRepository;
import com.expenses.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final WalletRepository walletRepository;

    public Page<TransferDTO> findAll(Long userId, Pageable pageable) {
        return transferRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    public TransferDTO findById(Long id, Long userId) {
        return transferRepository.findByIdAndUserId(id, userId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia no encontrada: " + id));
    }

    @Transactional
    public TransferDTO create(TransferDTO dto, Long userId, User user) {
        if (dto.getFromWalletId().equals(dto.getToWalletId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La wallet origen y destino no pueden ser la misma");
        }

        Wallet fromWallet = walletRepository.findByIdAndUserId(dto.getFromWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet origen no encontrada: " + dto.getFromWalletId()));

        Wallet toWallet = walletRepository.findByIdAndUserId(dto.getToWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet destino no encontrada: " + dto.getToWalletId()));

        fromWallet.setBalance(fromWallet.getBalance().subtract(dto.getAmount()));
        toWallet.setBalance(toWallet.getBalance().add(dto.getAmount()));
        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);

        Transfer transfer = new Transfer();
        transfer.setAmount(dto.getAmount());
        transfer.setDescription(dto.getDescription());
        transfer.setDate(dto.getDate());
        transfer.setFromWallet(fromWallet);
        transfer.setToWallet(toWallet);
        transfer.setUser(user);

        return toDTO(transferRepository.save(transfer));
    }

    private TransferDTO toDTO(Transfer t) {
        TransferDTO dto = new TransferDTO();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setDescription(t.getDescription());
        dto.setDate(t.getDate());
        dto.setFromWalletId(t.getFromWallet().getId());
        dto.setFromWalletName(t.getFromWallet().getName());
        dto.setToWalletId(t.getToWallet().getId());
        dto.setToWalletName(t.getToWallet().getName());
        dto.setCreatedAt(t.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return dto;
    }
}
