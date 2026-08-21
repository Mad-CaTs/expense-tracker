package com.expenses.wallet.internal;

import com.expenses.shared.exception.ResourceNotFoundException;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;
import com.expenses.wallet.WalletBalanceContribution;
import com.expenses.wallet.WalletDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final CardBackgroundRepository cardBackgroundRepository;
    private final WalletMapper walletMapper;
    private final List<WalletBalanceContribution> balanceContributions;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<WalletResponse> findAll(Long userId) {
        List<Wallet> wallets = walletRepository.findByUserIdOrderByCreatedAtAsc(userId);
        Map<Long, BigDecimal> net = new HashMap<>();
        for (WalletBalanceContribution contribution : balanceContributions) {
            contribution.inflowsByWallet(userId).forEach((walletId, total) -> net.merge(walletId, total, BigDecimal::add));
            contribution.outflowsByWallet(userId).forEach((walletId, total) -> net.merge(walletId, total.negate(), BigDecimal::add));
        }
        return wallets.stream()
                .map(w -> walletMapper.toResponse(w,
                        w.getInitialBalance().add(net.getOrDefault(w.getId(), BigDecimal.ZERO))))
                .toList();
    }

    @Transactional(readOnly = true)
    public WalletResponse findById(Long id, Long userId) {
        Wallet wallet = requireWallet(id, userId);
        return walletMapper.toResponse(wallet, calculateBalance(wallet));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateBalance(Long walletId, Long userId) {
        return calculateBalance(requireWallet(walletId, userId));
    }

    @Transactional
    public WalletResponse create(WalletRequest request, User user) {
        Wallet wallet = new Wallet();
        wallet.setName(request.getName());
        wallet.setInitialBalance(request.getInitialBalance());
        wallet.setColor(request.getColor());
        wallet.setIcon(request.getIcon());
        wallet.setLeather(request.getLeather());
        wallet.setUser(user);
        applyBackground(wallet, request.getBackgroundId());
        Wallet saved = walletRepository.save(wallet);
        return walletMapper.toResponse(saved, saved.getInitialBalance());
    }

    @Transactional
    public WalletResponse update(Long id, WalletRequest request, Long userId) {
        Wallet wallet = requireWallet(id, userId);
        wallet.setName(request.getName());
        wallet.setColor(request.getColor());
        wallet.setIcon(request.getIcon());
        wallet.setLeather(request.getLeather());
        applyBackground(wallet, request.getBackgroundId());
        applyCurrentBalance(wallet, request.getCurrentBalance());
        Wallet saved = walletRepository.save(wallet);
        return walletMapper.toResponse(saved, calculateBalance(saved));
    }

    /**
     * Cuadra la billetera con el saldo que la cuenta real tiene hoy.
     *
     * <p>El saldo no se guarda, se deriva: {@code inicial + movimientos netos}.
     * Para que el derivado dé exactamente el saldo pedido sin tocar los
     * movimientos ya registrados, lo que se mueve es el saldo inicial:
     * {@code nuevoInicial = saldoPedido - movimientosNetos}.
     *
     * <p>Los movimientos netos salen de restar el inicial actual al saldo
     * derivado actual, la misma resta que hace {@link #calculateBalance}.
     *
     * <p>El inicial resultante puede quedar negativo — ocurre cuando el saldo
     * real es menor que los ingresos ya registrados — y debe permitirse: es el
     * único modo de que una cuenta con historial incompleto en la app cuadre
     * con la realidad.
     */
    private void applyCurrentBalance(Wallet wallet, BigDecimal desiredBalance) {
        if (desiredBalance == null) {
            return;
        }
        BigDecimal netMovements = calculateBalance(wallet).subtract(wallet.getInitialBalance());
        wallet.setInitialBalance(desiredBalance.subtract(netMovements));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Wallet wallet = requireWallet(id, userId);
        eventPublisher.publishEvent(new WalletDeletedEvent(id, userId, LocalDateTime.now()));
        walletRepository.delete(wallet);
    }

    private BigDecimal calculateBalance(Wallet wallet) {
        Long walletId = wallet.getId();
        Long userId = wallet.getUser().getId();
        BigDecimal balance = wallet.getInitialBalance();
        for (WalletBalanceContribution contribution : balanceContributions) {
            balance = balance.add(contribution.inflow(userId, walletId))
                             .subtract(contribution.outflow(userId, walletId));
        }
        return balance;
    }

    private Wallet requireWallet(Long id, Long userId) {
        return walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet no encontrada: " + id));
    }

    private void applyBackground(Wallet wallet, Long backgroundId) {
        if (backgroundId == null) {
            wallet.setBackground(null);
        } else {
            CardBackground bg = cardBackgroundRepository.findById(backgroundId)
                    .orElseThrow(() -> new ResourceNotFoundException("Fondo no encontrado: " + backgroundId));
            wallet.setBackground(bg);
        }
    }
}
