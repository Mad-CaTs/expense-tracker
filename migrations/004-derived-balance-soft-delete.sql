-- 004: Fase 1 — balance derivado de movimientos + soft-delete + índices de agregación.
--      wallets.balance deja de mantenerse a mano: el balance se DERIVA de
--      initial_balance + ingresos - gastos + transferencias entrantes - salientes.
--      La columna balance queda muerta (nullable) hasta poder eliminarla.

-- 1) balance ya no es mantenido por la app
ALTER TABLE wallets ALTER COLUMN balance DROP NOT NULL;

-- 2) soft-delete: los movimientos y wallets se marcan, nunca se borran físicamente
ALTER TABLE expenses           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE incomes            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE transfers          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE wallets            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE budgets            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 3) índices obligatorios para que los SUM de balance sean rápidos
CREATE INDEX IF NOT EXISTS idx_expenses_wallet_date  ON expenses(wallet_id, date);
CREATE INDEX IF NOT EXISTS idx_incomes_wallet_date   ON incomes(wallet_id, date);
CREATE INDEX IF NOT EXISTS idx_transfers_from_wallet ON transfers(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_wallet   ON transfers(to_wallet_id);

-- 4) budgets: el unique solo aplica a filas vivas (permite recrear un presupuesto
--    borrado para la misma categoría/wallet)
DROP INDEX IF EXISTS uq_budgets_user_category_wallet;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_category_id_wallet_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_wallet
    ON budgets (user_id, category_id, wallet_id) WHERE deleted_at IS NULL;
