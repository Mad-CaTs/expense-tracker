package com.expenses.savings.internal;

import com.expenses.shared.jpa.Auditable;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Un guardar o sacar de una alcancía, con su fecha.
 *
 * <p>No se edita ni se borra suelto: un error se corrige con el movimiento
 * contrario. Borrar uno viejo podría dejar la alcancía en negativo a partir de
 * un retiro posterior, y movería los cierres de meses ya pasados.
 */
@Entity
@Table(name = "piggy_movements")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@SQLRestriction("deleted_at IS NULL")
public class PiggyMovement extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "piggy_bank_id", nullable = false)
    private Long piggyBankId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @ToString.Exclude
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PiggyMovementType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "moved_on", nullable = false)
    private LocalDate movedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
