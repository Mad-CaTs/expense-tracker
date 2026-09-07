package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.shared.security.AuthenticatedUserResolver;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
public class DebtController {

    private final DebtService debtService;
    private final AuthenticatedUserResolver userResolver;

    /** Agrupado por persona: es la pregunta que se hace el usuario. */
    @GetMapping
    public List<DebtPersonGroup> findGrouped(
            @RequestParam(defaultValue = "THEY_OWE") DebtDirection direction) {
        return debtService.findGrouped(userResolver.getCurrentUserId(), direction);
    }

    /** Totales de las dos direcciones, para el aviso de /expenses. */
    @GetMapping("/summary")
    public Map<String, BigDecimal> summary() {
        Long userId = userResolver.getCurrentUserId();
        return Map.of(
                "theyOwe", debtService.totalPending(userId, DebtDirection.THEY_OWE),
                "iOwe", debtService.totalPending(userId, DebtDirection.I_OWE));
    }

    /** Historial de abonos de una deuda pagada por partes. */
    @GetMapping("/{id}/payments")
    public List<DebtPaymentResponse> findPayments(@PathVariable Long id) {
        return debtService.findPayments(id, userResolver.getCurrentUserId());
    }

    /** Reparto de un gasto concreto, para poder editarlo sin perderlo. */
    @GetMapping("/by-expense/{expenseId}")
    public List<DebtResponse> findByExpense(@PathVariable Long expenseId) {
        return debtService.findByExpense(expenseId, userResolver.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DebtResponse create(@Valid @RequestBody DebtRequest request) {
        var user = userResolver.getCurrentUser();
        return debtService.createLoose(request, user.getId(), user);
    }

    @PostMapping("/{id}/pay")
    public DebtResponse pay(@PathVariable Long id, @Valid @RequestBody DebtPaymentRequest request) {
        var user = userResolver.getCurrentUser();
        return debtService.pay(id, request, user.getId(), user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        debtService.delete(id, userResolver.getCurrentUserId());
    }
}
