package com.expenses.shared.validation;

/**
 * Límites de longitud de los campos de texto libre.
 *
 * Son límites de PRODUCTO, no de esquema: las columnas aguantan más
 * (varchar 500/1000/255), pero una descripción es un rótulo para reconocer el
 * movimiento en una lista, no un párrafo.
 *
 * Espejo de `frontend-next/src/lib/utils/fieldLimits.ts`: al cambiar uno hay
 * que cambiar el otro, o el formulario y el servidor discrepan.
 */
public final class FieldLimits {

    /** Descripción de gasto, ingreso, transferencia y recurrente. */
    public static final int DESCRIPTION = 100;

    /** Nota de gasto e ingreso. */
    public static final int NOTES = 200;

    /** Nombre de un deudor. Texto libre: no hay entidad Persona. */
    public static final int PERSON_NAME = 100;

    private FieldLimits() {
    }
}
