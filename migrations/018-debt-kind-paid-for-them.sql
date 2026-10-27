-- 018: "pagué por alguien" como tipo de deuda.
--
-- Espejo de PAID_FOR_ME en "Te deben": pagaste algo por otra persona. A
-- diferencia de "pagó por mí", el dinero SÍ salió de tu billetera al pagar,
-- así que lleva billetera y descuenta al crearse; vuelve cuando te pagan. Se
-- separa de LOAN solo por la sección en que se muestra (Gastos compartidos).

ALTER TABLE debts
  DROP CONSTRAINT IF EXISTS debts_kind_valid;
ALTER TABLE debts
  ADD CONSTRAINT debts_kind_valid CHECK (kind IN ('LOAN', 'PAID_FOR_ME', 'PAID_FOR_THEM'));
