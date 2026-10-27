package com.expenses.savings.internal;

import com.expenses.shared.exception.BusinessRuleException;
import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletBalances;
import com.expenses.wallet.WalletFinder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.expenses.savings.internal.PiggyMovementType.DEPOSIT;
import static com.expenses.savings.internal.PiggyMovementType.WITHDRAWAL;

/**
 * Alcancías: dinero apartado dentro de una billetera.
 *
 * <p>Ni el disponible ni lo apartado se guardan. Un depósito aporta al saldo
 * de la billetera como un egreso y un retiro como un ingreso (ver
 * {@link PiggyWalletHooks}), así que el disponible ya sale sin lo apartado.
 */
@Service
@RequiredArgsConstructor
public class PiggyBankService {

    static final int MAX_PER_WALLET = 4;
    private static final String NOT_FOUND = "Alcancía no encontrada: ";

    private final PiggyBankRepository piggyBankRepository;
    private final PiggyMovementRepository movementRepository;
    private final WalletFinder walletFinder;
    private final WalletBalances walletBalances;

    @Transactional(readOnly = true)
    public List<PiggyBankResponse> list(Long walletId, Long userId) {
        requireWallet(walletId, userId);
        Map<Long, BigDecimal> balances = balancesIn(walletId, userId);
        return piggyBankRepository.findByUserIdAndWalletIdOrderByCreatedAtAscIdAsc(userId, walletId).stream()
                .map(p -> toResponse(p, balances.getOrDefault(p.getId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public PiggyBankResponse create(Long walletId, PiggyBankRequest request, Long userId, User user) {
        Wallet wallet = requireWallet(walletId, userId);
        if (piggyBankRepository.countByUserIdAndWalletId(userId, walletId) >= MAX_PER_WALLET) {
            throw new BusinessRuleException("Una billetera admite hasta " + MAX_PER_WALLET + " alcancías");
        }
        String name = request.getName().trim();
        if (piggyBankRepository.existsByUserIdAndWalletIdAndNameIgnoreCase(userId, walletId, name)) {
            throw duplicateName(name);
        }

        PiggyBank piggy = new PiggyBank();
        piggy.setName(name);
        piggy.setWallet(wallet);
        piggy.setUser(user);
        return toResponse(piggyBankRepository.save(piggy), BigDecimal.ZERO);
    }

    @Transactional
    public PiggyBankResponse rename(Long id, PiggyBankRequest request, Long userId) {
        PiggyBank piggy = requirePiggy(id, userId);
        String name = request.getName().trim();
        if (piggyBankRepository.existsByUserIdAndWalletIdAndNameIgnoreCaseAndIdNot(
                userId, piggy.getWallet().getId(), name, id)) {
            throw duplicateName(name);
        }
        piggy.setName(name);
        return toResponse(piggyBankRepository.save(piggy), balanceOf(id, userId));
    }

    /** Guardar o sacar. Devuelve la alcancía con su nuevo saldo. */
    @Transactional
    public PiggyBankResponse move(Long id, PiggyMovementRequest request, Long userId) {
        PiggyBank piggy = requirePiggy(id, userId);
        BigDecimal saved = balanceOf(id, userId);
        BigDecimal amount = request.getAmount();

        if (request.getType() == DEPOSIT) {
            requireAvailable(piggy, amount, userId);
        } else if (amount.compareTo(saved) > 0) {
            throw new BusinessRuleException("La alcancía solo tiene " + money(saved));
        }

        record(piggy, request.getType(), amount, request.getDate());
        return toResponse(piggy, request.getType() == DEPOSIT ? saved.add(amount) : saved.subtract(amount));
    }

    @Transactional(readOnly = true)
    public List<PiggyMovementResponse> movements(Long id, Long userId) {
        requirePiggy(id, userId);
        return movementRepository.findByUserIdAndPiggyBankIdOrderByMovedOnDescIdDesc(userId, id).stream()
                .map(m -> new PiggyMovementResponse(m.getId(), m.getType(), m.getAmount(), m.getMovedOn()))
                .toList();
    }

    /** Movimientos de todas las alcancías de la billetera en el rango, rotas incluidas. */
    @Transactional(readOnly = true)
    public List<WalletPiggyMovementResponse> walletMovements(Long walletId, Long userId, LocalDate from, LocalDate to) {
        requireWallet(walletId, userId);
        List<PiggyMovement> rows = movementRepository
                .findByUserIdAndWalletIdAndMovedOnBetweenOrderByMovedOnDescIdDesc(userId, walletId, from, to);
        Map<Long, String> names = namesOf(rows, userId);
        return rows.stream()
                .map(m -> new WalletPiggyMovementResponse(m.getId(), m.getPiggyBankId(),
                        names.get(m.getPiggyBankId()), m.getType(), m.getAmount(), m.getMovedOn(),
                        m.getCreatedAt() == null ? null : m.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))
                .toList();
    }

    /**
     * Romper la alcancía: lo que quede vuelve hoy al saldo disponible y la
     * alcancía se archiva. Sus movimientos NO se borran —siguen contando—, así
     * que los cierres de meses pasados no cambian.
     *
     * @return lo que volvió al saldo
     */
    @Transactional
    public BigDecimal breakOpen(Long id, Long userId) {
        PiggyBank piggy = requirePiggy(id, userId);
        BigDecimal remaining = balanceOf(id, userId);
        if (remaining.signum() > 0) {
            record(piggy, WITHDRAWAL, remaining, LocalDate.now());
        }
        piggyBankRepository.delete(piggy);
        return remaining;
    }

    /* Hoy la app deja que el saldo quede negativo; apartar plata que no hay,
       en cambio, no tiene sentido. */
    private void requireAvailable(PiggyBank piggy, BigDecimal amount, Long userId) {
        BigDecimal available = walletBalances.available(piggy.getWallet().getId(), userId);
        if (amount.compareTo(available) > 0) {
            throw new BusinessRuleException("No puedes guardar más de lo disponible (" + money(available) + ")");
        }
    }

    private void record(PiggyBank piggy, PiggyMovementType type, BigDecimal amount, LocalDate date) {
        PiggyMovement movement = new PiggyMovement();
        movement.setPiggyBankId(piggy.getId());
        movement.setWallet(piggy.getWallet());
        movement.setUser(piggy.getUser());
        movement.setType(type);
        movement.setAmount(amount);
        movement.setMovedOn(date);
        movementRepository.save(movement);
    }

    private BigDecimal balanceOf(Long piggyId, Long userId) {
        return movementRepository.sumByPiggyAndType(userId, piggyId, DEPOSIT)
                .subtract(movementRepository.sumByPiggyAndType(userId, piggyId, WITHDRAWAL));
    }

    /** Saldo de cada alcancía de la billetera en una sola consulta. */
    private Map<Long, BigDecimal> balancesIn(Long walletId, Long userId) {
        Map<Long, BigDecimal> balances = new HashMap<>();
        for (var row : movementRepository.sumByWalletGroupedByPiggyAndType(userId, walletId)) {
            BigDecimal signed = row.getType() == DEPOSIT ? row.getTotal() : row.getTotal().negate();
            balances.merge(row.getPiggyBankId(), signed, BigDecimal::add);
        }
        return balances;
    }

    private Map<Long, String> namesOf(List<PiggyMovement> rows, Long userId) {
        Set<Long> ids = rows.stream().map(PiggyMovement::getPiggyBankId).collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        Map<Long, String> names = new HashMap<>();
        for (Object[] row : piggyBankRepository.findNamesIncludingBroken(userId, ids)) {
            names.put(((Number) row[0]).longValue(), (String) row[1]);
        }
        return names;
    }

    private Wallet requireWallet(Long walletId, Long userId) {
        return walletFinder.findOwned(walletId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + walletId));
    }

    private PiggyBank requirePiggy(Long id, Long userId) {
        return piggyBankRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND + id));
    }

    private static BusinessRuleException duplicateName(String name) {
        return new BusinessRuleException("Ya tienes una alcancía llamada \"" + name + "\" en esta billetera");
    }

    private static String money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static PiggyBankResponse toResponse(PiggyBank piggy, BigDecimal balance) {
        return new PiggyBankResponse(piggy.getId(), piggy.getWallet().getId(), piggy.getName(), balance);
    }
}
