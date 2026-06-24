-- 002: catálogo de fondos de tarjeta + columna en wallets
CREATE TABLE IF NOT EXISTS card_backgrounds (
    id        BIGSERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL UNIQUE,
    position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS background_id BIGINT
    REFERENCES card_backgrounds(id) ON DELETE SET NULL;

-- Seed de skins (URLs públicas en R2). Idempotente.
INSERT INTO card_backgrounds (name, image_url, position) VALUES
  ('Esmeralda', 'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/ESMERALDA.png', 1),
  ('Zafiro',    'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/ZAFIRO.png', 2),
  ('Índigo',    'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/INDIGO.png', 3),
  ('Océano',    'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/OCEANO.png', 4),
  ('Dorado',    'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/DORADO.png', 5),
  ('Ámbar',     'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/AMBAR.png', 6),
  ('Rosa',      'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/ROSA.png', 7),
  ('Vino',      'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/VINO.png', 8),
  ('Acero',     'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/ACERO.png', 9),
  ('Carbón',    'https://pub-9be4d45b1f4e4c9a869f708de0984f55.r2.dev/wallet-skins/CARBON.png', 10)
ON CONFLICT (image_url) DO NOTHING;
