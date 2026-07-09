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
  type       VARCHAR(10)  NOT NULL DEFAULT 'EXPENSE' CHECK (type IN ('EXPENSE','INCOME')),
  user_id    BIGINT       REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(500),
  date        DATE          NOT NULL,
  category_id BIGINT        NOT NULL REFERENCES categories(id),
  user_id     BIGINT        REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  notes       VARCHAR(1000),
  deleted_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  family_id   VARCHAR(36)  NOT NULL,
  used_at     TIMESTAMP,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id     ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date          ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id   ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id       ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date     ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(date, category_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash    ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family  ON refresh_tokens(family_id);

CREATE TABLE IF NOT EXISTS idempotency_key (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(255) NOT NULL,
  request_hash    VARCHAR(64)  NOT NULL,
  request_path    VARCHAR(255) NOT NULL,
  response_status INT,
  response_body   TEXT,
  created_at      TIMESTAMP    DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS card_backgrounds (
    id        BIGSERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL UNIQUE,
    position  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wallets (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  initial_balance NUMERIC(12,2) NOT NULL,
  balance         NUMERIC(12,2),
  color           VARCHAR(7),
  icon            VARCHAR(50),
  background_id   BIGINT        REFERENCES card_backgrounds(id) ON DELETE SET NULL,
  user_id         BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMP     DEFAULT NOW(),
  updated_at      TIMESTAMP     DEFAULT NOW(),
  deleted_at      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS wallet_id BIGINT REFERENCES wallets(id);
CREATE INDEX IF NOT EXISTS idx_expenses_wallet_date ON expenses(wallet_id, date);

CREATE TABLE IF NOT EXISTS incomes (
  id          BIGSERIAL PRIMARY KEY,
  amount      NUMERIC(12,2) NOT NULL,
  description VARCHAR(500),
  date        DATE          NOT NULL,
  notes       VARCHAR(1000),
  wallet_id   BIGINT        REFERENCES wallets(id),
  user_id     BIGINT        NOT NULL REFERENCES users(id),
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  category_id BIGINT        REFERENCES categories(id) ON DELETE SET NULL,
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_wallet_date ON incomes(wallet_id, date);

CREATE TABLE IF NOT EXISTS transfers (
  id             BIGSERIAL PRIMARY KEY,
  amount         NUMERIC(12,2) NOT NULL,
  description    VARCHAR(500),
  date           DATE          NOT NULL,
  from_wallet_id BIGINT        NOT NULL REFERENCES wallets(id),
  to_wallet_id   BIGINT        NOT NULL REFERENCES wallets(id),
  user_id        BIGINT        NOT NULL REFERENCES users(id),
  created_at     TIMESTAMP     DEFAULT NOW(),
  deleted_at     TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transfers_from_wallet ON transfers(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_wallet   ON transfers(to_wallet_id);

CREATE TABLE IF NOT EXISTS budgets (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  wallet_id   BIGINT        NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id   ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_wallet_id ON budgets(wallet_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_wallet
    ON budgets (user_id, category_id, wallet_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  wallet_id   BIGINT        NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description VARCHAR(255),
  frequency   VARCHAR(20)   NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY','WEEKLY','YEARLY')),
  start_date  DATE          NOT NULL,
  next_date   DATE          NOT NULL,
  active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  deleted_at  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id   ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_date ON recurring_expenses(next_date, active);
CREATE INDEX IF NOT EXISTS idx_recurring_wallet_id ON recurring_expenses(wallet_id);

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

CREATE TABLE IF NOT EXISTS expense_attachments (
    id           BIGSERIAL PRIMARY KEY,
    expense_id   BIGINT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_key     VARCHAR(500) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size    BIGINT NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED')),
    created_at   TIMESTAMP DEFAULT NOW()
);