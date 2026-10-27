package com.expenses.savings.internal;

import com.expenses.shared.validation.FieldLimits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PiggyBankRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = FieldLimits.PIGGY_NAME, message = "El nombre admite hasta " + FieldLimits.PIGGY_NAME + " caracteres")
    private String name;
}
