-- 013: Deudas (dinero prestado y adeudado).
--
-- Una fila por PERSONA y por origen: una cena repartida entre Omar y José son
-- dos filas. `expense_id` nulo = préstamo suelto (presté efectivo sin gasto),
-- que es el único caso en que la deuda mueve el saldo al crearse.
--
-- El estado (PENDING/PARTIAL/SETTLED) NO se almacena: se deriva de paid_amount
-- contra amount. Un campo aparte podría contradecir al monto cobrado.

CREATE TABLE IF NOT EXISTS debts (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT        NOT NULL REFERENCES users(id),
  direction    VARCHAR(20)   NOT NULL CHECK (direction IN ('THEY_OWE','I_OWE')),
  person_name  VARCHAR(100)  NOT NULL,
  -- lower(trim(person_name)); agrupa "Omar" y "omar" bajo la misma persona.
  person_key   VARCHAR(100)  NOT NULL,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_amount  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  expense_id   BIGINT        REFERENCES expenses(id),
  wallet_id    BIGINT        REFERENCES wallets(id),
  description  VARCHAR(100),
  incurred_on  DATE          NOT NULL,
  settled_on   DATE,
  created_at   TIMESTAMP     DEFAULT NOW(),
  updated_at   TIMESTAMP     DEFAULT NOW(),
  deleted_at   TIMESTAMP,
  -- Nunca se puede cobrar más de lo que se debe.
  CONSTRAINT debts_paid_within_amount CHECK (paid_amount <= amount)
);

CREATE INDEX IF NOT EXISTS idx_debts_user_direction ON debts(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_debts_user_person    ON debts(user_id, person_key);
CREATE INDEX IF NOT EXISTS idx_debts_expense        ON debts(expense_id);

-- Cada cobro es una fila: lleva SU fecha y SU billetera. Pagaste la cena con
-- tarjeta y Omar te devuelve en efectivo otro día — por eso no basta con un
-- contador en `debts`.
CREATE TABLE IF NOT EXISTS debt_payments (
  id         BIGSERIAL PRIMARY KEY,
  debt_id    BIGINT        NOT NULL REFERENCES debts(id),
  user_id    BIGINT        NOT NULL REFERENCES users(id),
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  wallet_id  BIGINT        NOT NULL REFERENCES wallets(id),
  paid_on    DATE          NOT NULL,
  created_at TIMESTAMP     DEFAULT NOW(),
  updated_at TIMESTAMP     DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_debt_payments_debt   ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_wallet ON debt_payments(user_id, wallet_id);

-- Parte del gasto que corresponde a otros. Las estadísticas cuentan
-- (amount - reimbursable_amount); con DEFAULT 0 todo gasto existente conserva
-- su importe exacto.
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS reimbursable_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE expenses
  DROP CONSTRAINT IF EXISTS expenses_reimbursable_within_amount;
ALTER TABLE expenses
  ADD CONSTRAINT expenses_reimbursable_within_amount
  CHECK (reimbursable_amount >= 0 AND reimbursable_amount <= amount);
