package com.expenses.debt.internal;

/**
 * Cómo nació una deuda SUELTA (sin gasto), que decide si movió dinero.
 *
 * <table>
 *   <tr><td>{@link #LOAN}</td><td>Hubo efectivo: un préstamo dado o recibido. Mueve la billetera al crearse.</td></tr>
 *   <tr><td>{@link #PAID_FOR_ME}</td><td>Alguien pagó algo por mí: no entró dinero, así que no lleva billetera ni toca el saldo hasta que pago.</td></tr>
 *   <tr><td>{@link #PAID_FOR_THEM}</td><td>Pagué algo por otra persona: salió dinero de mi billetera (la lleva) y vuelve cuando me paga. Para el saldo es como un préstamo dado; se distingue por cómo se muestra.</td></tr>
 * </table>
 *
 * Las deudas que cuelgan de un gasto quedan como {@code LOAN}: no se miran por
 * su tipo sino por {@code expenseId}, y no llevan billetera.
 */
public enum DebtKind {
    LOAN,
    PAID_FOR_ME,
    PAID_FOR_THEM
}
