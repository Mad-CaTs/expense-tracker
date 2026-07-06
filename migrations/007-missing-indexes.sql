-- 007: Fase 3 — índices declarados en init.sql que nunca se aplicaron a la DB real
--      (detectados al comparar contenedor fresco vs esquema real).

CREATE INDEX IF NOT EXISTS idx_recurring_next_date    ON recurring_expenses(next_date, active);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id      ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id        ON wallets(user_id);
