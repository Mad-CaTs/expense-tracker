package com.expenses.wallet.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import com.expenses.wallet.MonthlyBalanceDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<WalletResponse> findAll() {
        return walletService.findAll(userResolver.getCurrentUserId());
    }

    @GetMapping("/{id}")
    public WalletResponse findById(@PathVariable Long id) {
        return walletService.findById(id, userResolver.getCurrentUserId());
    }

    /**
     * Evolución del saldo: el cierre de cada mes del rango pedido.
     *
     * <p>Por billetera y no global: cada una lleva su propio saldo —y su propia
     * moneda—, así que sumarlas daría una cifra sin significado.
     */
    @GetMapping("/{id}/monthly-balances")
    public List<MonthlyBalanceDTO> monthlyBalances(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return walletService.getMonthlyBalances(id, userResolver.getCurrentUserId(), from, to);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletResponse create(@Valid @RequestBody WalletRequest request) {
        return walletService.create(request, userResolver.getCurrentUser());
    }

    @PutMapping("/{id}")
    public WalletResponse update(@PathVariable Long id, @Valid @RequestBody WalletRequest request) {
        return walletService.update(id, request, userResolver.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        walletService.delete(id, userResolver.getCurrentUserId());
    }
}
