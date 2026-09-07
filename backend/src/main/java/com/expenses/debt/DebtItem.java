package com.expenses.debt;

import com.expenses.shared.validation.FieldLimits;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Una persona y su parte dentro del reparto de un gasto.
 *
 * <p>Vive en la API pública del módulo porque {@code expense} la usa al crear un
 * gasto con reparto.
 */
@Data
public class DebtItem {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = FieldLimits.PERSON_NAME)
    private String personName;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;
}
