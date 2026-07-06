package com.expenses.transfer.internal;

import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock TransferRepository transferRepository;
    @Mock WalletFinder walletFinder;
    @Spy TransferMapper transferMapper = Mappers.getMapper(TransferMapper.class);
    @InjectMocks TransferService transferService;

    private User user;
    private Wallet fromWallet;
    private Wallet toWallet;
    private TransferRequest request;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        fromWallet = new Wallet();
        fromWallet.setId(10L);
        fromWallet.setName("Origen");
        fromWallet.setInitialBalance(new BigDecimal("500.00"));

        toWallet = new Wallet();
        toWallet.setId(20L);
        toWallet.setName("Destino");
        toWallet.setInitialBalance(new BigDecimal("100.00"));

        request = new TransferRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setFromWalletId(10L);
        request.setToWalletId(20L);
    }

    @Test
    void create_valid_savesTransfer() {
        when(walletFinder.findOwned(10L, 1L)).thenReturn(Optional.of(fromWallet));
        when(walletFinder.findOwned(20L, 1L)).thenReturn(Optional.of(toWallet));
        when(transferRepository.save(any())).thenAnswer(inv -> {
            Transfer saved = inv.getArgument(0);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        TransferResponse result = transferService.create(request, 1L, user);

        assertThat(result.fromWalletId()).isEqualTo(10L);
        assertThat(result.toWalletId()).isEqualTo(20L);
    }

    @Test
    void create_sameWallet_throwsBusinessRule() {
        request.setToWalletId(10L);
        assertThatThrownBy(() -> transferService.create(request, 1L, user))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void create_foreignWallet_throwsNotFound() {
        when(walletFinder.findOwned(10L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> transferService.create(request, 1L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_notFound_throwsException() {
        when(transferRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> transferService.update(99L, request, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_valid_reassignsWalletsAndAmount() {
        Transfer existing = transferWith(fromWallet, toWallet);
        when(transferRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(existing));
        when(walletFinder.findOwned(10L, 1L)).thenReturn(Optional.of(fromWallet));
        when(walletFinder.findOwned(20L, 1L)).thenReturn(Optional.of(toWallet));
        when(transferRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        request.setAmount(new BigDecimal("75.00"));
        TransferResponse result = transferService.update(1L, request, 1L);

        assertThat(result.amount()).isEqualByComparingTo("75.00");
    }

    @Test
    void delete_existing_delegatesToRepository() {
        Transfer existing = transferWith(fromWallet, toWallet);
        when(transferRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(existing));

        transferService.delete(1L, 1L);

        verify(transferRepository).delete(existing);
    }

    private Transfer transferWith(Wallet from, Wallet to) {
        Transfer transfer = new Transfer();
        transfer.setId(1L);
        transfer.setAmount(new BigDecimal("50.00"));
        transfer.setDate(LocalDate.now());
        transfer.setFromWallet(from);
        transfer.setToWallet(to);
        transfer.setUser(user);
        transfer.setCreatedAt(LocalDateTime.now());
        return transfer;
    }
}
