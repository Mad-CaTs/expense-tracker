-- 001: categorías con tipo (EXPENSE | INCOME) + categoría opcional en ingresos
ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'EXPENSE';
ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_type;
ALTER TABLE categories ADD CONSTRAINT chk_categories_type CHECK (type IN ('EXPENSE','INCOME'));

ALTER TABLE incomes ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
