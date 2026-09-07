package com.expenses.debt;

import com.expenses.shared.user.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Lo que el módulo {@code expense} necesita del módulo {@code debt}.
 *
 * <p>Es la ÚNICA puerta entre ambos: `expense` no conoce las entidades de deuda,
 * solo pide crear el reparto y recibe cuánto suma.
 */
public interface DebtsForExpense {

    /**
     * Crea el reparto de un gasto y devuelve la suma repartida, que el gasto
     * guarda como {@code reimbursableAmount}.
     *
     * @throws com.expenses.shared.exception.BusinessRuleException si lo repartido
     *         supera el importe del gasto.
     */
    BigDecimal replaceForExpense(Long expenseId, Long userId, User user,
                                 List<DebtItem> items, BigDecimal expenseAmount,
                                 LocalDate incurredOn, String description);

    /** Soft-delete del reparto cuando se borra el gasto: evita deudas huérfanas. */
    void deleteForExpense(Long expenseId, Long userId);

    /** Cuántas deudas pendientes cuelgan del gasto — para avisar antes de borrarlo. */
    BigDecimal pendingForExpense(Long expenseId, Long userId);
}
