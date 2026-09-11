-- 014: moneda por billetera.
--
-- Hasta ahora "S/" estaba escrito a mano en toda la UI: una billetera en
-- dólares mostraba sus importes con el símbolo del sol. La moneda pasa a ser
-- un dato de la billetera.
--
-- SIN conversión: cada billetera muestra SUS importes en SU moneda y no se
-- mezclan. Un tipo de cambio obligaría a decidir si un gasto de hace un mes se
-- revalúa con el cambio de hoy —lo que reescribiría el historial— y eso es una
-- feature aparte, no un símbolo distinto.
--
-- Las filas existentes quedan en PEN, que es lo que la app venía mostrando:
-- así ninguna billetera cambia de aspecto sola.

ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'PEN';

-- Incluye las borradas: siguen siendo restaurables y deben conservar su moneda.
ALTER TABLE wallets
  DROP CONSTRAINT IF EXISTS wallets_currency_valid;
ALTER TABLE wallets
  ADD CONSTRAINT wallets_currency_valid CHECK (currency IN ('PEN', 'USD', 'EUR'));
