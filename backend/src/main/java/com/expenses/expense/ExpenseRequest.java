package com.expenses.expense;

import com.expenses.debt.DebtItem;
import com.expenses.shared.validation.FieldLimits;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ExpenseRequest {

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @Size(max = FieldLimits.DESCRIPTION)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate date;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @Size(max = FieldLimits.NOTES)
    private String notes;

    private Long walletId;

    /**
     * Reparto del gasto: quién debe cuánto. Vacío o nulo = gasto normal.
     *
     * <p>{@code @Valid} en cascada para que se validen los items, no solo la
     * lista.
     */
    @Valid
    private List<DebtItem> debts;
}
