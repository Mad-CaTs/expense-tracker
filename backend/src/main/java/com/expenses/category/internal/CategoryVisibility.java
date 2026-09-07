package com.expenses.category.internal;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Categoría que NO debe ofrecerse al registrar desde una billetera concreta.
 *
 * Guarda solo las excepciones: sin fila, la categoría es visible. Ocultar no
 * borra ni desvincula nada — los movimientos ya registrados con esa categoría
 * siguen contando en reportes y presupuestos.
 *
 * La billetera se referencia por id y no por entidad: `wallet` es otro módulo
 * de Modulith y `category` no puede depender de su modelo.
 */
@Entity
@Table(name = "category_visibility")
@IdClass(CategoryVisibility.Key.class)
@Getter
@Setter
@NoArgsConstructor
public class CategoryVisibility {

    @Id
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Id
    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CategoryVisibility(Long categoryId, Long walletId) {
        this.categoryId = categoryId;
        this.walletId = walletId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class Key implements Serializable {
        private Long categoryId;
        private Long walletId;
    }
}
