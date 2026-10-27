package com.expenses.savings.internal;

import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletBalances;
import com.expenses.wallet.WalletFinder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static com.expenses.savings.internal.PiggyMovementType.DEPOSIT;
import static com.expenses.savings.internal.PiggyMovementType.WITHDRAWAL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PiggyBankServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long WALLET_ID = 7L;
    private static final Long PIGGY_ID = 3L;

    @Mock PiggyBankRepository piggyBankRepository;
    @Mock PiggyMovementRepository movementRepository;
    @Mock WalletFinder walletFinder;
    @Mock WalletBalances walletBalances;
    @InjectMocks PiggyBankService service;

    private User user;
    private Wallet wallet;
    private PiggyBank piggy;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        wallet = new Wallet();
        wallet.setId(WALLET_ID);
        piggy = new PiggyBank();
        piggy.setId(PIGGY_ID);
        piggy.setName("Viaje");
        piggy.setWallet(wallet);
        piggy.setUser(user);

        when(walletFinder.findOwned(WALLET_ID, USER_ID)).thenReturn(Optional.of(wallet));
        when(piggyBankRepository.findByIdAndUserId(PIGGY_ID, USER_ID)).thenReturn(Optional.of(piggy));
        when(piggyBankRepository.save(any(PiggyBank.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("una billetera admite hasta 4 alcancías")
    void create_fifth_throws() {
        when(piggyBankRepository.countByUserIdAndWalletId(USER_ID, WALLET_ID)).thenReturn(4L);

        assertThatThrownBy(() -> service.create(WALLET_ID, request("Auto"), USER_ID, user))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("hasta 4");
    }

    @Test
    @DisplayName("no se repite el nombre dentro de la billetera, sin importar mayúsculas")
    void create_duplicateName_throws() {
        when(piggyBankRepository.existsByUserIdAndWalletIdAndNameIgnoreCase(USER_ID, WALLET_ID, "viaje"))
                .thenReturn(true);

        assertThatThrownBy(() -> service.create(WALLET_ID, request("viaje"), USER_ID, user))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Ya tienes");
    }

    @Test
    @DisplayName("se crea vacía y con el nombre recortado")
    void create_startsEmpty() {
        PiggyBankResponse res = service.create(WALLET_ID, request("  Emergencias  "), USER_ID, user);

        assertThat(res.name()).isEqualTo("Emergencias");
        assertThat(res.balance()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("no se puede guardar más de lo disponible")
    void deposit_overAvailable_throws() {
        when(walletBalances.available(WALLET_ID, USER_ID)).thenReturn(new BigDecimal("100.00"));
        savedSoFar("0", "0");

        assertThatThrownBy(() -> service.move(PIGGY_ID, movement(DEPOSIT, "150.00"), USER_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("disponible (100.00)");
        verify(movementRepository, never()).save(any());
    }

    @Test
    @DisplayName("guardar registra el depósito y devuelve el nuevo saldo de la alcancía")
    void deposit_recordsAndReturnsBalance() {
        when(walletBalances.available(WALLET_ID, USER_ID)).thenReturn(new BigDecimal("500.00"));
        savedSoFar("200.00", "50.00");

        PiggyBankResponse res = service.move(PIGGY_ID, movement(DEPOSIT, "100.00"), USER_ID);

        assertThat(res.balance()).isEqualByComparingTo("250.00");
        PiggyMovement saved = capturedMovement();
        assertThat(saved.getType()).isEqualTo(DEPOSIT);
        assertThat(saved.getWallet()).isSameAs(wallet);
        assertThat(saved.getPiggyBankId()).isEqualTo(PIGGY_ID);
    }

    @Test
    @DisplayName("no se puede sacar más de lo que tiene la alcancía")
    void withdraw_overSaved_throws() {
        savedSoFar("150.00", "0");

        assertThatThrownBy(() -> service.move(PIGGY_ID, movement(WITHDRAWAL, "200.00"), USER_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("solo tiene 150.00");
    }

    @Test
    @DisplayName("sacar no depende del saldo disponible")
    void withdraw_ignoresAvailable() {
        savedSoFar("150.00", "0");

        PiggyBankResponse res = service.move(PIGGY_ID, movement(WITHDRAWAL, "150.00"), USER_ID);

        assertThat(res.balance()).isEqualByComparingTo("0");
        verify(walletBalances, never()).available(any(), any());
    }

    @Test
    @DisplayName("romperla devuelve hoy lo que quede y la archiva")
    void breakOpen_returnsRemainderToday() {
        savedSoFar("300.00", "100.00");

        BigDecimal returned = service.breakOpen(PIGGY_ID, USER_ID);

        assertThat(returned).isEqualByComparingTo("200.00");
        PiggyMovement saved = capturedMovement();
        assertThat(saved.getType()).isEqualTo(WITHDRAWAL);
        assertThat(saved.getAmount()).isEqualByComparingTo("200.00");
        assertThat(saved.getMovedOn()).isEqualTo(LocalDate.now());
        verify(piggyBankRepository).delete(piggy);
    }

    @Test
    @DisplayName("romper una alcancía vacía no deja movimiento")
    void breakOpen_empty_onlyArchives() {
        savedSoFar("100.00", "100.00");

        service.breakOpen(PIGGY_ID, USER_ID);

        verify(movementRepository, never()).save(any());
        verify(piggyBankRepository).delete(piggy);
    }

    @Test
    @DisplayName("los movimientos de la billetera llevan el nombre de su alcancía, aunque esté rota")
    void walletMovements_namesIncludeBrokenPiggies() {
        LocalDate from = LocalDate.of(2026, 10, 1);
        LocalDate to = LocalDate.of(2026, 10, 31);
        PiggyMovement fromBroken = new PiggyMovement();
        fromBroken.setId(50L);
        fromBroken.setPiggyBankId(9L);
        fromBroken.setType(WITHDRAWAL);
        fromBroken.setAmount(new BigDecimal("80.00"));
        fromBroken.setMovedOn(LocalDate.of(2026, 10, 5));
        when(movementRepository.findByUserIdAndWalletIdAndMovedOnBetweenOrderByMovedOnDescIdDesc(USER_ID, WALLET_ID, from, to))
                .thenReturn(java.util.List.of(fromBroken));
        when(piggyBankRepository.findNamesIncludingBroken(USER_ID, java.util.Set.of(9L)))
                .thenReturn(java.util.List.<Object[]>of(new Object[]{9L, "Regalos"}));

        var res = service.walletMovements(WALLET_ID, USER_ID, from, to);

        assertThat(res).singleElement().satisfies(m -> {
            assertThat(m.piggyName()).isEqualTo("Regalos");
            assertThat(m.type()).isEqualTo(WITHDRAWAL);
        });
    }

    private void savedSoFar(String deposits, String withdrawals) {
        when(movementRepository.sumByPiggyAndType(USER_ID, PIGGY_ID, DEPOSIT)).thenReturn(new BigDecimal(deposits));
        when(movementRepository.sumByPiggyAndType(USER_ID, PIGGY_ID, WITHDRAWAL)).thenReturn(new BigDecimal(withdrawals));
    }

    private PiggyMovement capturedMovement() {
        ArgumentCaptor<PiggyMovement> captor = ArgumentCaptor.forClass(PiggyMovement.class);
        verify(movementRepository).save(captor.capture());
        return captor.getValue();
    }

    private PiggyBankRequest request(String name) {
        PiggyBankRequest r = new PiggyBankRequest();
        r.setName(name);
        return r;
    }

    private PiggyMovementRequest movement(PiggyMovementType type, String amount) {
        PiggyMovementRequest r = new PiggyMovementRequest();
        r.setType(type);
        r.setAmount(new BigDecimal(amount));
        r.setDate(LocalDate.now());
        return r;
    }
}
