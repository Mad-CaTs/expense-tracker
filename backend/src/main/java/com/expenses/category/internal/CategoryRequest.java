package com.expenses.category.internal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "El color es obligatorio")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color debe ser un hex válido (#RRGGBB)")
    private String color;

    @NotBlank(message = "El ícono es obligatorio")
    @Size(max = 50)
    private String icon;

    @Pattern(regexp = "EXPENSE|INCOME", message = "Tipo debe ser EXPENSE o INCOME")
    private String type;
}
