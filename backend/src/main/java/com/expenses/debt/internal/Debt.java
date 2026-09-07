package com.expenses.debt.internal;

import com.expenses.debt.DebtDirection;
import com.expenses.debt.DebtStatus;
import com.expenses.shared.jpa.Auditable;
import com.expenses.shared.user.User;
import com.expenses.wallet.Wallet;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Dinero prestado o adeudado a UNA persona.
 *
 * <p>Una cena repartida entre dos amigos son dos filas: cada uno paga por su
 * cuenta y en su momento.
 *
 * <p>{@code expenseId} nulo = préstamo suelto (presté efectivo sin gasto de por
 * medio). Es el único caso en que la deuda mueve el saldo al crearse: cuando
 * cuelga de un gasto, ese gasto ya descontó el total.
 */
@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@SQLDelete(sql = "UPDATE debts SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Debt extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DebtDirection direction;

    @Column(name = "person_name", nullable = false, length = 100)
    private String personName;

    /** {@code lower(trim(personName))}: agrupa "Omar" y "omar" como uno solo. */
    @Column(name = "person_key", nullable = false, length = 100)
    private String personKey;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    /** Gasto del que nace la deuda. Nulo en un préstamo suelto. */
    @Column(name = "expense_id")
    private Long expenseId;

    /** Billetera de la que salió un préstamo suelto. Nula si cuelga de un gasto. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    @ToString.Exclude
    private Wallet wallet;

    @Column(length = 100)
    private String description;

    @Column(name = "incurred_on", nullable = false)
    private LocalDate incurredOn;

    @Column(name = "settled_on")
    private LocalDate settledOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /** Lo que falta por cobrar/pagar. */
    public BigDecimal getPending() {
        return amount.subtract(paidAmount);
    }

    /**
     * Estado DERIVADO, no almacenado: un campo aparte podría contradecir a
     * {@code paidAmount}.
     */
    public DebtStatus getStatus() {
        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) return DebtStatus.PENDING;
        return paidAmount.compareTo(amount) >= 0 ? DebtStatus.SETTLED : DebtStatus.PARTIAL;
    }
}
