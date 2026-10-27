package com.expenses.savings.internal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static com.expenses.savings.internal.PiggyMovementType.DEPOSIT;
import static com.expenses.savings.internal.PiggyMovementType.WITHDRAWAL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PiggyWalletHooksTest {

    private static final Long USER_ID = 1L;
    private static final Long WALLET_ID = 7L;

    @Mock PiggyMovementRepository movementRepository;
    @Mock PiggyBankRepository piggyBankRepository;
    @InjectMocks PiggyWalletHooks hooks;

    @Test
    @DisplayName("guardar sale del disponible y sacar vuelve a él")
    void depositsAreOutflow_withdrawalsAreInflow() {
        when(movementRepository.sumByWalletAndType(USER_ID, WALLET_ID, DEPOSIT)).thenReturn(new BigDecimal("300"));
        when(movementRepository.sumByWalletAndType(USER_ID, WALLET_ID, WITHDRAWAL)).thenReturn(new BigDecimal("120"));

        assertThat(hooks.outflow(USER_ID, WALLET_ID)).isEqualByComparingTo("300");
        assertThat(hooks.inflow(USER_ID, WALLET_ID)).isEqualByComparingTo("120");
    }

    @Test
    @DisplayName("al cierre de un mes, lo apartado hasta esa fecha resta del disponible")
    void netUpTo_isWithdrawalsMinusDeposits() {
        LocalDate cutoff = LocalDate.of(2026, 9, 30);
        when(movementRepository.sumByWalletAndTypeUpTo(USER_ID, WALLET_ID, DEPOSIT, cutoff)).thenReturn(new BigDecimal("500"));
        when(movementRepository.sumByWalletAndTypeUpTo(USER_ID, WALLET_ID, WITHDRAWAL, cutoff)).thenReturn(new BigDecimal("200"));

        assertThat(hooks.netUpTo(USER_ID, WALLET_ID, cutoff)).isEqualByComparingTo("-300");
    }
}
