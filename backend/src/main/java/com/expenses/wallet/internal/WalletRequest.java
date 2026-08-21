package com.expenses.wallet.internal;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WalletRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String name;

    /**
     * Solo en el alta: con qué saldo arranca la billetera. Al crearla todavía no
     * hay movimientos, así que el inicial y el actual son el mismo número y
     * exigir que no sea negativo tiene sentido.
     */
    @DecimalMin(value = "0.0", inclusive = true, message = "El saldo inicial no puede ser negativo")
    private BigDecimal initialBalance;

    /**
     * Solo en la edición: el saldo que la cuenta real tiene HOY. El servicio
     * recalcula {@code initialBalance} hacia atrás para que el saldo derivado
     * coincida con este valor, sin tocar los movimientos ya registrados.
     *
     * <p>Es un campo aparte de {@code initialBalance} a propósito: son dos
     * magnitudes distintas — el saldo de partida frente al saldo de hoy — y con
     * un único campo que cambiase de significado según el verbo HTTP no se
     * podrían validar por separado: al crear, el saldo inicial no puede ser
     * negativo; al editar, el inicial que resulta del cálculo sí puede serlo.
     *
     * <p>Nulo deja el saldo como está, para quien solo edita el aspecto.
     */
    @DecimalMin(value = "0.0", inclusive = true, message = "El saldo no puede ser negativo")
    private BigDecimal currentBalance;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color inválido")
    private String color;

    @Size(max = 50)
    private String icon;

    @Pattern(regexp = "^(green|tan|brown|burgundy|navy|teal|plum|charcoal)$",
             message = "Acabado de cuero inválido")
    private String leather;

    private Long backgroundId;
}
