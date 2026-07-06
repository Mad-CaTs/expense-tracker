-- 009: FASE A de seguridad — adjuntos en dos fases (A3) y refresh token family (A5).

ALTER TABLE expense_attachments
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
  CHECK (status IN ('PENDING','CONFIRMED'));
UPDATE expense_attachments SET status = 'CONFIRMED';

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS family_id VARCHAR(36);
UPDATE refresh_tokens SET family_id = gen_random_uuid()::text WHERE family_id IS NULL;
ALTER TABLE refresh_tokens ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
