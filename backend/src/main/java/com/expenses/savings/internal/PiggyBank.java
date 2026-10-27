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
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Alcancía: dinero apartado dentro de una billetera.
 *
 * <p>No guarda su saldo: sale de sus movimientos, igual que el de la billetera.
 * Borrarla es "romperla" y solo la archiva —sus movimientos siguen contando—.
 */
@Entity
@Table(name = "piggy_banks")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@SQLDelete(sql = "UPDATE piggy_banks SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class PiggyBank extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 30)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @ToString.Exclude
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
