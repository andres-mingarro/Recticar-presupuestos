ALTER TYPE orden_trabajo_estado ADD VALUE IF NOT EXISTS 'presupuesto_entregado' AFTER 'pendiente';

UPDATE ordenes_trabajo
SET estado = 'presupuesto_entregado'::orden_trabajo_estado
WHERE estado::text = 'entregado';

ALTER TABLE ordenes_trabajo
  ADD COLUMN IF NOT EXISTS fecha_presupuesto_entregado timestamptz;

UPDATE ordenes_trabajo
SET fecha_presupuesto_entregado = COALESCE(updated_at, fecha_creacion)
WHERE estado = 'presupuesto_entregado'::orden_trabajo_estado
  AND fecha_presupuesto_entregado IS NULL;

ALTER TABLE empresa_configuracion
  ADD COLUMN IF NOT EXISTS auto_eliminar_presupuestos_entregados boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meses_retencion_presupuesto_entregado integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS ultima_ejecucion_limpieza timestamptz;
