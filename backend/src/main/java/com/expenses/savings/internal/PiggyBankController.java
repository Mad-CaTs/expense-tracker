package com.expenses.savings.internal;

import com.expenses.shared.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PiggyBankController {

    private final PiggyBankService piggyBankService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping("/wallets/{walletId}/piggy-banks")
    public List<PiggyBankResponse> list(@PathVariable Long walletId) {
        return piggyBankService.list(walletId, userResolver.getCurrentUserId());
    }

    @PostMapping("/wallets/{walletId}/piggy-banks")
    @ResponseStatus(HttpStatus.CREATED)
    public PiggyBankResponse create(@PathVariable Long walletId, @Valid @RequestBody PiggyBankRequest request) {
        var user = userResolver.getCurrentUser();
        return piggyBankService.create(walletId, request, user.getId(), user);
    }

    /** Para la lista de Reportes: todo lo guardado y sacado en la billetera en el rango. */
    @GetMapping("/wallets/{walletId}/piggy-movements")
    public List<WalletPiggyMovementResponse> walletMovements(
            @PathVariable Long walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return piggyBankService.walletMovements(walletId, userResolver.getCurrentUserId(), from, to);
    }

    @PutMapping("/piggy-banks/{id}")
    public PiggyBankResponse rename(@PathVariable Long id, @Valid @RequestBody PiggyBankRequest request) {
        return piggyBankService.rename(id, request, userResolver.getCurrentUserId());
    }

    @GetMapping("/piggy-banks/{id}/movements")
    public List<PiggyMovementResponse> movements(@PathVariable Long id) {
        return piggyBankService.movements(id, userResolver.getCurrentUserId());
    }

    @PostMapping("/piggy-banks/{id}/movements")
    @ResponseStatus(HttpStatus.CREATED)
    public PiggyBankResponse move(@PathVariable Long id, @Valid @RequestBody PiggyMovementRequest request) {
        return piggyBankService.move(id, request, userResolver.getCurrentUserId());
    }

    /** Romper la alcancía: lo que tenga vuelve al saldo disponible. */
    @DeleteMapping("/piggy-banks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void breakOpen(@PathVariable Long id) {
        piggyBankService.breakOpen(id, userResolver.getCurrentUserId());
    }
}
