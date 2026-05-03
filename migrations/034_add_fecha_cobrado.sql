ALTER TABLE ordenes_trabajo
  ADD COLUMN IF NOT EXISTS fecha_cobrado TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monto_cobrado INT;

-- Backfill: para trabajos ya cobrados, usar fecha_creacion como aproximación
-- y calcular monto desde snapshots existentes
UPDATE ordenes_trabajo ot
SET
  fecha_cobrado = ot.fecha_creacion,
  monto_cobrado = (
    SELECT COALESCE(SUM(ott.precio_snapshot * ott.cantidad), 0)
    FROM orden_trabajo_trabajos ott
    WHERE ott.orden_trabajo_id = ot.id
  ) + (
    SELECT COALESCE(SUM(otr.precio * otr.cantidad), 0)
    FROM orden_trabajo_repuestos otr
    WHERE otr.orden_trabajo_id = ot.id
  )
WHERE cobrado = true;
