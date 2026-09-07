package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.debt.DebtItem;
import com.expenses.debt.DebtsForExpense;
import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletFinder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DebtService implements DebtsForExpense {

    private static final String DEBT_NOT_FOUND = "Deuda no encontrada: ";

    private final DebtRepository debtRepository;
    private final DebtPaymentRepository paymentRepository;
    private final WalletFinder walletFinder;

    /* ── Consulta ── */

    @Transactional(readOnly = true)
    public List<DebtPersonGroup> findGrouped(Long userId, DebtDirection direction) {
        List<Debt> debts = debtRepository.findByUserAndDirection(userId, direction);

        // LinkedHashMap: el repositorio ya ordena por personKey, así el orden de
        // los grupos es estable entre llamadas.
        Map<String, List<Debt>> byPerson = new LinkedHashMap<>();
        for (Debt d : debts) {
            byPerson.computeIfAbsent(d.getPersonKey(), k -> new ArrayList<>()).add(d);
        }

        List<DebtPersonGroup> groups = new ArrayList<>();
        for (List<Debt> rows : byPerson.values()) {
            BigDecimal pending = rows.stream()
                    .map(Debt::getPending)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            groups.add(new DebtPersonGroup(
                    // El nombre visible es el de la fila más reciente: si se
                    // escribió "omar" y luego "Omar", manda la última grafía.
                    rows.get(0).getPersonName(),
                    pending,
                    rows.stream().map(this::toResponse).toList()));
        }
        // Primero quien más debe: es el orden en que se quiere cobrar.
        groups.sort((a, b) -> b.pending().compareTo(a.pending()));
        return groups;
    }

    @Transactional(readOnly = true)
    public BigDecimal totalPending(Long userId, DebtDirection direction) {
        return debtRepository.sumPendingByDirection(userId, direction);
    }

    /**
     * Abonos de una deuda, del más reciente al más antiguo.
     *
     * <p>Con pagos parciales, "pagó S/50 de 80" no dice CUÁNDO entró ese dinero
     * ni a qué billetera; cada abono es una fila con su fecha propia.
     */
    @Transactional(readOnly = true)
    public List<DebtPaymentResponse> findPayments(Long debtId, Long userId) {
        // Comprueba la propiedad de la deuda antes de listar sus pagos: sin
        // esto, un id ajeno devolvería los abonos de otro usuario.
        debtRepository.findByIdAndUserId(debtId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(DEBT_NOT_FOUND + debtId));

        return paymentRepository.findByUserIdAndDebtIdOrderByPaidOnDescIdDesc(userId, debtId).stream()
                .map(p -> new DebtPaymentResponse(
                        p.getId(), p.getAmount(), p.getPaidOn(),
                        p.getWallet() == null ? null : p.getWallet().getId(),
                        p.getWallet() == null ? null : p.getWallet().getName()))
                .toList();
    }

    /** Reparto de un gasto: sin esto, editarlo lo borraría en silencio. */
    @Transactional(readOnly = true)
    public List<DebtResponse> findByExpense(Long expenseId, Long userId) {
        return debtRepository.findByUserIdAndExpenseId(userId, expenseId).stream()
                .map(this::toResponse)
                .toList();
    }

    /* ── Préstamo suelto ── */

    @Transactional
    public DebtResponse createLoose(DebtRequest request, Long userId, User user) {
        Wallet wallet = requireWallet(request.getWalletId(), userId);

        Debt debt = new Debt();
        debt.setDirection(request.getDirection());
        applyPerson(debt, request.getPersonName());
        debt.setAmount(request.getAmount());
        debt.setPaidAmount(BigDecimal.ZERO);
        debt.setWallet(wallet);
        debt.setDescription(request.getDescription());
        debt.setIncurredOn(request.getIncurredOn());
        debt.setUser(user);

        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(DEBT_NOT_FOUND + id));
        // Los cobros se van con la deuda: por sí solos no significan nada.
        paymentRepository.softDeleteByDebtIds(userId, List.of(debt.getId()), java.time.LocalDateTime.now());
        debtRepository.delete(debt);
    }

    /* ── Cobro ── */

    @Transactional
    public DebtResponse pay(Long id, DebtPaymentRequest request, Long userId, User user) {
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(DEBT_NOT_FOUND + id));

        BigDecimal pending = debt.getPending();
        if (pending.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Esta deuda ya está saldada");
        }
        if (request.getAmount().compareTo(pending) > 0) {
            throw new BusinessRuleException(
                    "No puedes cobrar más de lo pendiente (S/ " + pending + ")");
        }

        Wallet wallet = requireWallet(request.getWalletId(), userId);

        DebtPayment payment = new DebtPayment();
        payment.setDebtId(debt.getId());
        payment.setAmount(request.getAmount());
        payment.setWallet(wallet);
        payment.setPaidOn(request.getPaidOn());
        payment.setUser(user);
        paymentRepository.save(payment);

        debt.setPaidAmount(debt.getPaidAmount().add(request.getAmount()));
        // settledOn marca el día en que quedó a cero, no el de cada abono.
        if (debt.getPending().compareTo(BigDecimal.ZERO) <= 0) {
            debt.setSettledOn(request.getPaidOn());
        }
        return toResponse(debtRepository.save(debt));
    }

    /* ── Puerta hacia el módulo expense ── */

    @Override
    @Transactional
    public BigDecimal replaceForExpense(Long expenseId, Long userId, User user,
                                        List<DebtItem> items, BigDecimal expenseAmount,
                                        LocalDate incurredOn, String description) {
        List<Debt> existing = debtRepository.findByUserIdAndExpenseId(userId, expenseId);

        if (items == null || items.isEmpty()) {
            // Al editar un gasto se puede quitar el reparto; los cobros ya hechos
            // se van con él, porque sin deuda no representan nada.
            if (!existing.isEmpty()) deleteForExpense(expenseId, userId);
            return BigDecimal.ZERO;
        }

        BigDecimal total = items.stream()
                .map(DebtItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(expenseAmount) > 0) {
            throw new BusinessRuleException(
                    "Lo repartido (S/ " + total + ") supera el gasto (S/ " + expenseAmount + ")");
        }

        // Se rehace el reparto en bloque: casar fila a fila con lo que había
        // enredaría el caso de renombrar a una persona, y estas listas son de
        // dos o tres elementos.
        if (!existing.isEmpty()) deleteForExpense(expenseId, userId);

        for (DebtItem item : items) {
            Debt debt = new Debt();
            debt.setDirection(DebtDirection.THEY_OWE);
            applyPerson(debt, item.getPersonName());
            debt.setAmount(item.getAmount());
            debt.setPaidAmount(BigDecimal.ZERO);
            debt.setExpenseId(expenseId);
            // Sin billetera a propósito: el gasto ya descontó el total, así que
            // esta deuda no debe aportar al saldo (ver DebtWalletHooks).
            debt.setDescription(description);
            debt.setIncurredOn(incurredOn);
            debt.setUser(user);
            debtRepository.save(debt);
        }
        return total;
    }

    @Override
    @Transactional
    public void deleteForExpense(Long expenseId, Long userId) {
        List<Debt> debts = debtRepository.findByUserIdAndExpenseId(userId, expenseId);
        if (debts.isEmpty()) return;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        paymentRepository.softDeleteByDebtIds(userId, debts.stream().map(Debt::getId).toList(), now);
        debtRepository.softDeleteByExpenseId(userId, expenseId, now);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal pendingForExpense(Long expenseId, Long userId) {
        return debtRepository.findByUserIdAndExpenseId(userId, expenseId).stream()
                .map(Debt::getPending)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /* ── Auxiliares ── */

    /**
     * El nombre se guarda tal cual se escribió, y la clave normalizada agrupa:
     * sin entidad Persona, es lo que hace que "Omar" y "omar" sean uno solo.
     */
    private Wallet requireWallet(Long walletId, Long userId) {
        return walletFinder.findOwned(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + walletId));
    }

    private void applyPerson(Debt debt, String rawName) {
        String name = rawName.trim();
        debt.setPersonName(name);
        debt.setPersonKey(name.toLowerCase(Locale.ROOT));
    }

    private DebtResponse toResponse(Debt d) {
        return new DebtResponse(
                d.getId(), d.getDirection(), d.getPersonName(),
                d.getAmount(), d.getPaidAmount(), d.getPending(), d.getStatus(),
                d.getExpenseId(), d.getWallet() == null ? null : d.getWallet().getId(),
                d.getDescription(), d.getIncurredOn(), d.getSettledOn());
    }
}
