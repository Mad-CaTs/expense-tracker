-- 017: tipo de deuda suelta.
--
-- "Debo" solo sabía registrar PRÉSTAMOS recibidos: el dinero entraba a la
-- billetera al crearlos y salía al pagarlos. Falta el caso "alguien pagó por
-- mí": no entra dinero, y solo pagar la deuda lo descuenta. Ese tipo no lleva
-- billetera, y sin billetera la deuda no aporta al saldo (ver DebtWalletHooks).
--
-- Las filas existentes son todas préstamos o deudas de un gasto: LOAN por
-- defecto las deja funcionando igual.

ALTER TABLE debts
  ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'LOAN';

ALTER TABLE debts
  DROP CONSTRAINT IF EXISTS debts_kind_valid;
ALTER TABLE debts
  ADD CONSTRAINT debts_kind_valid CHECK (kind IN ('LOAN', 'PAID_FOR_ME'));
