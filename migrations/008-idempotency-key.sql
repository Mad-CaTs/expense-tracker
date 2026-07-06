-- 008: Fase 5 — idempotencia en POST financieros (expenses/incomes/transfers).
--      Una fila por (user_id, Idempotency-Key); memoriza la respuesta 2xx.
--      El UNIQUE resuelve la carrera de dos requests simultáneas con la misma clave.

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
