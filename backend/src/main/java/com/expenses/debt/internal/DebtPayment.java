package com.expenses.debt.internal;

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
 * Un cobro (o pago) sobre una deuda.
 *
 * <p>Lleva SU fecha y SU billetera: se pagó la cena con tarjeta y el amigo
 * devuelve en efectivo, otro día. Por eso es una fila y no un contador — es lo
 * que aporta al saldo, y a qué billetera.
 */
@Entity
@Table(name = "debt_payments")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@SQLDelete(sql = "UPDATE debt_payments SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class DebtPayment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "debt_id", nullable = false)
    private Long debtId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @ToString.Exclude
    private Wallet wallet;

    @Column(name = "paid_on", nullable = false)
    private LocalDate paidOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
