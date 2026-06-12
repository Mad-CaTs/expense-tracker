package com.expenses.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeDTO {
    private Long id;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @Size(max = 500)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate date;

    @Size(max = 1000)
    private String notes;

    private Long walletId;
    private String walletName;

    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
}
