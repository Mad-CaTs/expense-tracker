-- 012: el acabado del cuero deja de derivarse del color y pasa a guardarse.
--
-- Hasta ahora `color` decidía dos cosas a la vez: qué textura de cuero se
-- mostraba (por matiz, en themeForColor) y el tinte de la tarjeta. Con 8
-- acabados elegibles esa derivación deja de servir: el usuario elige el cuero
-- que quiere, no el que su matiz implique. `color` queda solo para la tarjeta.

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS leather VARCHAR(16);

-- Preserva la apariencia actual de las billeteras existentes: se guarda el
-- acabado que hoy se calcula por matiz, replicando themeForColor exactamente
-- (75..175 -> green, 30..<75 -> tan, resto -> brown). Sin esto, todas caerían
-- al fallback y las billeteras cambiarían de aspecto solas.
--
-- El matiz se calcula igual que hexToHsl en cardVisuals.ts: componentes RGB
-- normalizados a 0..1, sector de 60 grados según cuál es el máximo. Y se
-- redondea antes de comparar, porque categoryHueSat devuelve Math.round(h)
-- y themeForColor compara ese entero contra los umbrales.
-- themeForColor está en:
--   frontend-next/src/components/features/wallets/WalletLeatherCarousel.tsx:24
--
-- Esto es un congelado de un solo uso, no una regla viva: replica la
-- derivación por matiz que existía HASTA esta migración, solo para rellenar
-- las filas ya creadas. Cuando se añada un noveno acabado se toca LEATHER_SRC
-- en el frontend, nunca este archivo.
--
-- Incluye las billeteras con deleted_at: siguen siendo restaurables y deben
-- conservar su acabado.
WITH rgb AS (
    SELECT
        id,
        ('x' || substr(color, 2, 2))::bit(8)::int / 255.0 AS r,
        ('x' || substr(color, 4, 2))::bit(8)::int / 255.0 AS g,
        ('x' || substr(color, 6, 2))::bit(8)::int / 255.0 AS b
    FROM wallets
    -- Solo hex #rrggbb completo. Un hex inválido abortaría la migración entera
    -- al castear, y uno de 3 dígitos se corrompería en silencio: substr('#fff',6,2)
    -- da cadena vacía y ('x' || '')::bit(8)::int da 0, leyendo #fff como matiz 56
    -- (tan) en vez de brown. Lo que no pase el filtro cae al fallback 'green' del
    -- último UPDATE, el mismo destino que themeForColor(undefined).
    WHERE color ~ '^#[0-9a-fA-F]{6}$'
),
extremes AS (
    SELECT id, r, g, b, greatest(r, g, b) AS mx, least(r, g, b) AS mn
    FROM rgb
),
hue AS (
    SELECT
        id,
        CASE
            WHEN mx = mn THEN 0                                   -- gris: sin matiz
            WHEN mx = r  THEN 60 * (((g - b) / (mx - mn)) + CASE WHEN g < b THEN 6 ELSE 0 END)
            WHEN mx = g  THEN 60 * (((b - r) / (mx - mn)) + 2)
            ELSE              60 * (((r - g) / (mx - mn)) + 4)
        END AS h
    FROM extremes
)
UPDATE wallets w
SET leather = CASE
    WHEN h.h IS NULL             THEN 'green'
    WHEN round(h.h) BETWEEN 75 AND 175 THEN 'green'
    WHEN round(h.h) >= 30 AND round(h.h) < 75 THEN 'tan'
    ELSE 'brown'
END
FROM hue h
WHERE w.id = h.id AND w.leather IS NULL;

-- Las billeteras sin color caen al mismo fallback que themeForColor(undefined).
UPDATE wallets SET leather = 'green' WHERE leather IS NULL;
