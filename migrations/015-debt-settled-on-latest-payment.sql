-- 015: la fecha de saldo de una deuda es la de su abono MÁS RECIENTE.
--
-- Hasta ahora se guardaba la fecha del abono que llevó el pendiente a cero,
-- es decir, del último REGISTRADO. Si un abono olvidado se cargaba al final
-- con su fecha real —anterior—, la deuda quedaba "saldada" antes de que
-- entrara el último dinero, y la lista de saldadas la agrupaba en ese mes.
--
-- Solo toca deudas ya saldadas cuya fecha no coincide; repetirla no cambia nada.

UPDATE debts d
SET settled_on = p.last_paid
FROM (
  SELECT debt_id, MAX(paid_on) AS last_paid
  FROM debt_payments
  WHERE deleted_at IS NULL
  GROUP BY debt_id
) p
WHERE p.debt_id = d.id
  AND d.settled_on IS NOT NULL
  AND d.settled_on <> p.last_paid;
