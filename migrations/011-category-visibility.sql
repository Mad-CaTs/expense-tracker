-- 011: Ocultar categorías en billeteras concretas.
--
-- Las categorías siguen siendo del USUARIO: una sola "Comida", un solo total, un
-- solo presupuesto. Esta tabla guarda únicamente las EXCEPCIONES — qué categoría
-- no debe ofrecerse al registrar desde qué billetera.
--
-- Sin fila = visible. Por eso la migración no toca ningún dato existente: hasta
-- que el usuario oculte algo, todo se comporta igual que antes.
--
-- Ocultar NO borra ni desvincula nada: los movimientos ya registrados con esa
-- categoría siguen contando en reportes y presupuestos.

CREATE TABLE IF NOT EXISTS category_visibility (
  category_id BIGINT    NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  wallet_id   BIGINT    NOT NULL REFERENCES wallets(id)    ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (category_id, wallet_id)
);

-- El filtro del selector consulta por billetera: "qué está oculto en ésta".
CREATE INDEX IF NOT EXISTS idx_catvis_wallet ON category_visibility(wallet_id);
