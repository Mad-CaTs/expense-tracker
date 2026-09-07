package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * La regla de saldo es el punto más delicado de la feature: si una deuda ligada
 * a un gasto aportara al saldo, el dinero se restaría dos veces.
 */
@ExtendWith(MockitoExtension.class)
class DebtWalletHooksTest {

    private static final Long USER = 1L;
    private static final Long WALLET = 7L;

    @Mock DebtRepository debtRepository;
    @Mock DebtPaymentRepository paymentRepository;
    @InjectMocks DebtWalletHooks hooks;

    @Test
    @DisplayName("presté efectivo suelto: sale de la billetera")
    void looseTheyOwe_isOutflow() {
        when(debtRepository.sumLooseByWalletAndDirection(USER, WALLET, DebtDirection.THEY_OWE))
                .thenReturn(new BigDecimal("50.00"));
        when(paymentRepository.sumByWalletAndDirection(USER, WALLET, DebtDirection.I_OWE))
                .thenReturn(BigDecimal.ZERO);

        assertThat(hooks.outflow(USER, WALLET)).isEqualByComparingTo("50.00");
    }

    @Test
    @DisplayName("me cobran lo que presté: vuelve a la billetera")
    void paymentOnTheyOwe_isInflow() {
        when(debtRepository.sumLooseByWalletAndDirection(USER, WALLET, DebtDirection.I_OWE))
                .thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumByWalletAndDirection(USER, WALLET, DebtDirection.THEY_OWE))
                .thenReturn(new BigDecimal("100.00"));

        assertThat(hooks.inflow(USER, WALLET)).isEqualByComparingTo("100.00");
    }

    @Test
    @DisplayName("me prestaron a mí: entra dinero; al devolverlo, sale")
    void iOwe_flipsDirection() {
        when(debtRepository.sumLooseByWalletAndDirection(USER, WALLET, DebtDirection.I_OWE))
                .thenReturn(new BigDecimal("120.00"));
        when(paymentRepository.sumByWalletAndDirection(USER, WALLET, DebtDirection.THEY_OWE))
                .thenReturn(BigDecimal.ZERO);
        assertThat(hooks.inflow(USER, WALLET)).isEqualByComparingTo("120.00");

        when(debtRepository.sumLooseByWalletAndDirection(USER, WALLET, DebtDirection.THEY_OWE))
                .thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumByWalletAndDirection(USER, WALLET, DebtDirection.I_OWE))
                .thenReturn(new BigDecimal("120.00"));
        assertThat(hooks.outflow(USER, WALLET)).isEqualByComparingTo("120.00");
    }

    @Test
    @DisplayName("la deuda de un gasto NO toca el saldo: el gasto ya lo descontó")
    void debtLinkedToExpense_doesNotMoveBalance() {
        // El repositorio solo suma deudas con expenseId nulo, así que una deuda
        // ligada a un gasto no llega hasta acá: devuelve cero por ambos lados.
        when(debtRepository.sumLooseByWalletAndDirection(eq(USER), eq(WALLET), any()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumByWalletAndDirection(eq(USER), eq(WALLET), any()))
                .thenReturn(BigDecimal.ZERO);

        assertThat(hooks.inflow(USER, WALLET)).isEqualByComparingTo("0");
        assertThat(hooks.outflow(USER, WALLET)).isEqualByComparingTo("0");
    }
}
