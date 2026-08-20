package com.expenses.wallet.internal;

import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletBalanceContribution;
import com.expenses.wallet.WalletDeletedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock WalletRepository walletRepository;
    @Mock CardBackgroundRepository cardBackgroundRepository;
    @Mock WalletBalanceContribution contribution;
    @Mock ApplicationEventPublisher eventPublisher;

    private WalletService walletService;
    private User user;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        walletService = new WalletService(walletRepository, cardBackgroundRepository,
                Mappers.getMapper(WalletMapper.class), List.of(contribution), eventPublisher);

        user = new User();
        user.setId(1L);

        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("AHORROS");
        wallet.setInitialBalance(new BigDecimal("100.00"));
        wallet.setUser(user);
    }

    @Test
    void calculateBalance_derivesFromContributions() {
        when(walletRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(wallet));
        when(contribution.inflow(1L, 10L)).thenReturn(new BigDecimal("70.00"));
        when(contribution.outflow(1L, 10L)).thenReturn(new BigDecimal("40.00"));

        BigDecimal balance = walletService.calculateBalance(10L, 1L);

        assertThat(balance).isEqualByComparingTo("130.00");
    }

    @Test
    void findAll_usesGroupedContributionsWithoutPerWalletQueries() {
        Wallet other = new Wallet();
        other.setId(20L);
        other.setName("BCP");
        other.setInitialBalance(new BigDecimal("1000.00"));
        other.setUser(user);

        when(walletRepository.findByUserIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(wallet, other));
        when(contribution.inflowsByWallet(1L)).thenReturn(Map.of(10L, new BigDecimal("50.00"), 20L, new BigDecimal("5.00")));
        when(contribution.outflowsByWallet(1L)).thenReturn(Map.of(10L, new BigDecimal("35.00")));

        var result = walletService.findAll(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).balance()).isEqualByComparingTo("115.00");
        assertThat(result.get(1).balance()).isEqualByComparingTo("1005.00");
        verify(contribution, never()).inflow(anyLong(), anyLong());
        verify(contribution, never()).outflow(anyLong(), anyLong());
    }

    @Test
    void delete_publishesEventAndSoftDeletesWallet() {
        when(walletRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(wallet));

        walletService.delete(10L, 1L);

        ArgumentCaptor<WalletDeletedEvent> captor = ArgumentCaptor.forClass(WalletDeletedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertThat(captor.getValue().walletId()).isEqualTo(10L);
        assertThat(captor.getValue().userId()).isEqualTo(1L);
        assertThat(captor.getValue().deletedAt()).isNotNull();
        verify(walletRepository).delete(wallet);
    }
}
