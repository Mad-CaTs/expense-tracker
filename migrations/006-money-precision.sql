-- 006: Fase 3 — homogeneizar montos monetarios a NUMERIC(12,2)
--      (expenses/budgets/recurring estaban en NUMERIC(10,2); incomes/transfers ya eran 12,2).

ALTER TABLE expenses           ALTER COLUMN amount TYPE NUMERIC(12,2);
ALTER TABLE budgets            ALTER COLUMN amount TYPE NUMERIC(12,2);
ALTER TABLE recurring_expenses ALTER COLUMN amount TYPE NUMERIC(12,2);
