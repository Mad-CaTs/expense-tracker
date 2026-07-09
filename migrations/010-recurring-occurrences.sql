-- 010: Ocurrencias confirmables de gastos recurrentes.

CREATE TABLE IF NOT EXISTS recurring_occurrences (
  id           BIGSERIAL PRIMARY KEY,
  recurring_id BIGINT        NOT NULL REFERENCES recurring_expenses(id),
  user_id      BIGINT        NOT NULL REFERENCES users(id),
  due_date     DATE          NOT NULL,
  status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','SKIPPED')),
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_id   BIGINT        REFERENCES expenses(id),
  created_at   TIMESTAMP     DEFAULT NOW(),
  updated_at   TIMESTAMP     DEFAULT NOW(),
  deleted_at   TIMESTAMP,
  UNIQUE (recurring_id, due_date)
);
CREATE INDEX IF NOT EXISTS idx_occurrences_user_status ON recurring_occurrences(user_id, status);
