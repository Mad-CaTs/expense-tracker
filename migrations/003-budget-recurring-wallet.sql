-- 003: vincular budgets y recurring_expenses a un wallet.
--      budgets pasan a ser mensuales-recurrentes (se eliminan month/year).
--      Backfill de datos huérfanos al wallet AHORROS (id=1).

-- 0) gastos huérfanos
UPDATE expenses SET wallet_id = 1 WHERE wallet_id IS NULL;

-- 1) budgets.wallet_id
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS wallet_id BIGINT REFERENCES wallets(id) ON DELETE CASCADE;
UPDATE budgets SET wallet_id = 1 WHERE wallet_id IS NULL;
ALTER TABLE budgets ALTER COLUMN wallet_id SET NOT NULL;

-- 2) recurring_expenses.wallet_id
ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS wallet_id BIGINT REFERENCES wallets(id) ON DELETE CASCADE;
UPDATE recurring_expenses SET wallet_id = 1 WHERE wallet_id IS NULL;
ALTER TABLE recurring_expenses ALTER COLUMN wallet_id SET NOT NULL;

-- 3) budgets: quitar month/year + restricciones asociadas
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_user_id_category_id_month_year_key;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_check;
ALTER TABLE budgets DROP COLUMN IF EXISTS month;
ALTER TABLE budgets DROP COLUMN IF EXISTS year;

-- 4) colapsar duplicados (conservar el más reciente = mayor id) ANTES del índice único
DELETE FROM budgets b USING budgets b2
WHERE b.user_id = b2.user_id AND b.category_id = b2.category_id
  AND b.wallet_id = b2.wallet_id AND b.id < b2.id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_wallet ON budgets (user_id, category_id, wallet_id);

-- 5) índices
CREATE INDEX IF NOT EXISTS idx_budgets_wallet_id   ON budgets(wallet_id);
CREATE INDEX IF NOT EXISTS idx_recurring_wallet_id ON recurring_expenses(wallet_id);
