package com.expenses.transfer.internal;

import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransferService {

    private static final String TRANSFER_NOT_FOUND = "Transferencia no encontrada: ";

    private final TransferRepository transferRepository;
    private final WalletFinder walletFinder;
    private final TransferMapper transferMapper;

    @Transactional(readOnly = true)
    public Page<TransferResponse> findAll(Long userId, Pageable pageable) {
        return transferRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId, pageable)
                .map(transferMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransferResponse findById(Long id, Long userId) {
        return transferRepository.findByIdAndUserId(id, userId)
                .map(transferMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(TRANSFER_NOT_FOUND + id));
    }

    @Transactional
    public TransferResponse create(TransferRequest request, Long userId, User user) {
        Wallet[] wallets = resolveWallets(request, userId);

        Transfer transfer = new Transfer();
        transfer.setAmount(request.getAmount());
        transfer.setDescription(request.getDescription());
        transfer.setDate(request.getDate());
        transfer.setFromWallet(wallets[0]);
        transfer.setToWallet(wallets[1]);
        transfer.setUser(user);

        return transferMapper.toResponse(transferRepository.save(transfer));
    }

    @Transactional
    public TransferResponse update(Long id, TransferRequest request, Long userId) {
        Transfer transfer = transferRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(TRANSFER_NOT_FOUND + id));
        Wallet[] wallets = resolveWallets(request, userId);

        transfer.setAmount(request.getAmount());
        transfer.setDescription(request.getDescription());
        transfer.setDate(request.getDate());
        transfer.setFromWallet(wallets[0]);
        transfer.setToWallet(wallets[1]);

        return transferMapper.toResponse(transferRepository.save(transfer));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Transfer transfer = transferRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(TRANSFER_NOT_FOUND + id));
        transferRepository.delete(transfer);
    }

    private Wallet[] resolveWallets(TransferRequest request, Long userId) {
        if (request.getFromWalletId().equals(request.getToWalletId())) {
            throw new BusinessRuleException("La wallet origen y destino no pueden ser la misma");
        }
        Wallet fromWallet = walletFinder.findOwned(request.getFromWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet origen no encontrada: " + request.getFromWalletId()));
        Wallet toWallet = walletFinder.findOwned(request.getToWalletId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet destino no encontrada: " + request.getToWalletId()));
        return new Wallet[]{fromWallet, toWallet};
    }
}
