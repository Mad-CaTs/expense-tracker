package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.debt.DebtItem;
import com.expenses.debt.DebtStatus;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DebtServiceTest {

    private static final Long USER_ID = 1L;

    @Mock DebtRepository debtRepository;
    @Mock DebtPaymentRepository paymentRepository;
    @Mock WalletFinder walletFinder;
    @InjectMocks DebtService debtService;

    private User user;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        wallet = new Wallet();
        wallet.setId(7L);
        when(walletFinder.findOwned(any(), any())).thenReturn(Optional.of(wallet));
        when(debtRepository.save(any(Debt.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("el reparto no puede superar el gasto")
    void split_overExpenseAmount_throws() {
        when(debtRepository.findByUserIdAndExpenseId(USER_ID, 10L)).thenReturn(List.of());

        assertThatThrownBy(() -> debtService.replaceForExpense(
                10L, USER_ID, user,
                List.of(item("Omar", "200"), item("José", "250")),
                new BigDecimal("300.00"), LocalDate.now(), "Cena"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("supera el gasto");
    }

    @Test
    @DisplayName("una persona por fila; devuelve lo repartido")
    void split_createsOneDebtPerPerson() {
        when(debtRepository.findByUserIdAndExpenseId(USER_ID, 10L)).thenReturn(List.of());

        BigDecimal total = debtService.replaceForExpense(
                10L, USER_ID, user,
                List.of(item("Omar", "100"), item("José", "100")),
                new BigDecimal("300.00"), LocalDate.now(), "Cena");

        assertThat(total).isEqualByComparingTo("200");
    }

    @Test
    @DisplayName("sin reparto no se crea nada y suma cero")
    void split_empty_returnsZero() {
        when(debtRepository.findByUserIdAndExpenseId(USER_ID, 10L)).thenReturn(List.of());

        assertThat(debtService.replaceForExpense(10L, USER_ID, user, List.of(),
                new BigDecimal("300.00"), LocalDate.now(), "Cena"))
                .isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("cobro parcial deja la deuda en PARTIAL y sin fecha de saldo")
    void pay_partial_keepsDebtOpen() {
        Debt debt = debt(new BigDecimal("150.00"), BigDecimal.ZERO);
        when(debtRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(debt));

        DebtResponse res = debtService.pay(5L, payment("60.00"), USER_ID, user);

        assertThat(res.status()).isEqualTo(DebtStatus.PARTIAL);
        assertThat(res.pending()).isEqualByComparingTo("90.00");
        assertThat(res.settledOn()).isNull();
    }

    @Test
    @DisplayName("el último cobro la salda y fecha el saldo")
    void pay_full_settles() {
        Debt debt = debt(new BigDecimal("150.00"), new BigDecimal("90.00"));
        when(debtRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(debt));

        DebtResponse res = debtService.pay(5L, payment("60.00"), USER_ID, user);

        assertThat(res.status()).isEqualTo(DebtStatus.SETTLED);
        assertThat(res.pending()).isEqualByComparingTo("0.00");
        assertThat(res.settledOn()).isNotNull();
    }

    @Test
    @DisplayName("no se puede cobrar más de lo pendiente")
    void pay_moreThanPending_throws() {
        Debt debt = debt(new BigDecimal("100.00"), new BigDecimal("80.00"));
        when(debtRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(debt));

        assertThatThrownBy(() -> debtService.pay(5L, payment("50.00"), USER_ID, user))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("más de lo pendiente");
    }

    @Test
    @DisplayName("'Omar' y 'omar' caen bajo la misma persona")
    void personKey_isCaseInsensitive() {
        when(debtRepository.findByUserIdAndExpenseId(USER_ID, 10L)).thenReturn(List.of());

        debtService.replaceForExpense(10L, USER_ID, user,
                List.of(item("  Omar  ", "50")), new BigDecimal("100.00"),
                LocalDate.now(), "Cena");

        org.mockito.ArgumentCaptor<Debt> captor = org.mockito.ArgumentCaptor.forClass(Debt.class);
        org.mockito.Mockito.verify(debtRepository).save(captor.capture());
        assertThat(captor.getValue().getPersonName()).isEqualTo("Omar");
        assertThat(captor.getValue().getPersonKey()).isEqualTo("omar");
    }

    private DebtItem item(String name, String amount) {
        DebtItem i = new DebtItem();
        i.setPersonName(name);
        i.setAmount(new BigDecimal(amount));
        return i;
    }

    private DebtPaymentRequest payment(String amount) {
        DebtPaymentRequest r = new DebtPaymentRequest();
        r.setAmount(new BigDecimal(amount));
        r.setWalletId(7L);
        r.setPaidOn(LocalDate.now());
        return r;
    }

    private Debt debt(BigDecimal amount, BigDecimal paid) {
        Debt d = new Debt();
        d.setId(5L);
        d.setDirection(DebtDirection.THEY_OWE);
        d.setPersonName("Omar");
        d.setPersonKey("omar");
        d.setAmount(amount);
        d.setPaidAmount(paid);
        d.setIncurredOn(LocalDate.now());
        d.setUser(user);
        return d;
    }
}
