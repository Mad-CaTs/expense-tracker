-- init.sql
CREATE TABLE IF NOT EXISTS users (
  id                   BIGSERIAL PRIMARY KEY,
  username             VARCHAR(50)  NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7)   NOT NULL,
  icon       VARCHAR(50)  NOT NULL,
  user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(500),
  date        DATE          NOT NULL,
  category_id BIGINT        NOT NULL REFERENCES categories(id),
  user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id     ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date          ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id   ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id       ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date     ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash    ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS budgets (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  month       INTEGER       NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INTEGER       NOT NULL,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  UNIQUE (user_id, category_id, month, year)
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(500),
  frequency   VARCHAR(20)   NOT NULL CHECK (frequency IN ('MONTHLY','WEEKLY','YEARLY')),
  start_date  DATE          NOT NULL,
  next_date   DATE          NOT NULL,
  active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id   ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_date ON recurring_expenses(next_date, active);

-- Para crear un usuario: genera el hash con BCrypt (cost 10) y haz INSERT aquí.
-- Ejemplo (hash de "temporal123"):
-- INSERT INTO users (username, password_hash, must_change_password)
-- VALUES ('amigo1', '$2a$10$...hash...', true);

CREATE TABLE IF NOT EXISTS expense_attachments (
    id           BIGSERIAL PRIMARY KEY,
    expense_id   BIGINT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_key     VARCHAR(500) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size    BIGINT NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);
