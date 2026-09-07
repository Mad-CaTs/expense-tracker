package com.expenses.debt.internal;

import java.math.BigDecimal;
import java.util.List;

/**
 * Las deudas de una persona, ya agrupadas.
 *
 * <p>La pregunta real del usuario es "¿cuánto me debe Omar?", no "¿qué pasó con
 * la cena": agrupar en el servidor evita que cada cliente lo rehaga.
 */
public record DebtPersonGroup(
        String personName,
        BigDecimal pending,
        List<DebtResponse> debts
) {}
