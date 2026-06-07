package com.expenses.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransferDTO {
    private Long id;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @Size(max = 500)
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate date;

    @NotNull(message = "La wallet origen es obligatoria")
    private Long fromWalletId;

    @NotNull(message = "La wallet destino es obligatoria")
    private Long toWalletId;

    // Response only
    private String fromWalletName;
    private String toWalletName;
    private String createdAt;
}
