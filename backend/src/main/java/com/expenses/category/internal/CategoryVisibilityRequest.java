package com.expenses.category.internal;

import jakarta.validation.constraints.NotNull;

public record CategoryVisibilityRequest(
        @NotNull(message = "La billetera es obligatoria") Long walletId,
        @NotNull(message = "Indica si se oculta") Boolean hidden) {
}
