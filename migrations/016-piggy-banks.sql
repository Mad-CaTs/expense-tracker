-- 016: Alcancías.
--
-- Dinero que sigue en la billetera pero apartado: no cuenta como saldo
-- disponible hasta que se saca. Ni el disponible ni el apartado se guardan:
-- los dos se derivan de los movimientos, igual que el resto del saldo.
--
-- Hasta 4 por billetera (regla de producto, la aplica el servicio).

CREATE TABLE IF NOT EXISTS piggy_banks (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES users(id),
  wallet_id  BIGINT      NOT NULL REFERENCES wallets(id),
  name       VARCHAR(30) NOT NULL,
  created_at TIMESTAMP   DEFAULT NOW(),
  updated_at TIMESTAMP   DEFAULT NOW(),
  -- Romper la alcancía la archiva: sus movimientos siguen contando, así que los
  -- cierres de meses pasados no cambian.
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_piggy_banks_wallet ON piggy_banks(user_id, wallet_id);

-- Cada guardar/sacar es una fila con SU fecha: es lo que permite saber cuánto
-- había disponible al cierre de cualquier mes. `wallet_id` se repite aquí para
-- que el saldo de la billetera se sume sin unir tablas.
CREATE TABLE IF NOT EXISTS piggy_movements (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT        NOT NULL REFERENCES users(id),
  piggy_bank_id  BIGINT        NOT NULL REFERENCES piggy_banks(id),
  wallet_id      BIGINT        NOT NULL REFERENCES wallets(id),
  type           VARCHAR(20)   NOT NULL CHECK (type IN ('DEPOSIT','WITHDRAWAL')),
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  moved_on       DATE          NOT NULL,
  created_at     TIMESTAMP     DEFAULT NOW(),
  updated_at     TIMESTAMP     DEFAULT NOW(),
  deleted_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_piggy_movements_wallet ON piggy_movements(user_id, wallet_id, moved_on);
CREATE INDEX IF NOT EXISTS idx_piggy_movements_piggy  ON piggy_movements(piggy_bank_id);
