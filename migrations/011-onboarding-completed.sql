-- 011: marcar cuándo un usuario completó el onboarding.
--
-- No se deriva de `must_change_password`: ese campo se apaga al cambiar la
-- contraseña temporal, que es otro evento, y un reset de contraseña volvería a
-- activarlo mostrándole la bienvenida a un usuario antiguo.
--
-- Tampoco basta con `wallets = 0`: eso decide SI hay que crear una billetera
-- —y sigue siendo la condición para exigirlo—, pero quien borra todas sus
-- billeteras vería otra vez los slides de bienvenida. Esta marca separa las dos
-- preguntas: si ya lo completó, va directo al formulario.

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Los usuarios que ya tienen billeteras completaron el onboarding antes de que
-- existiera: sin esto, la primera vez que entren verían la bienvenida de una
-- app que ya usan. Se fecha con la creación de su billetera más antigua, que es
-- el momento en que de hecho terminaron.
UPDATE users u
SET onboarding_completed_at = COALESCE(
      (SELECT MIN(w.created_at) FROM wallets w WHERE w.user_id = u.id),
      NOW()
    )
WHERE u.onboarding_completed_at IS NULL
  AND EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);
