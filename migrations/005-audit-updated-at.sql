-- 005: Fase 2 — auditoría unificada (@MappedSuperclass Auditable).
--      transfers y recurring_expenses ganan updated_at (el resto ya lo tenía).
--      Backfill: updated_at = created_at para filas existentes.

ALTER TABLE transfers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
UPDATE transfers SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE transfers ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
UPDATE recurring_expenses SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE recurring_expenses ALTER COLUMN updated_at SET DEFAULT NOW();
