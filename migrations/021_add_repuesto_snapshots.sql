ALTER TABLE orden_trabajo_repuestos
  ADD COLUMN IF NOT EXISTS categoria_nombre_snapshot varchar(255),
  ADD COLUMN IF NOT EXISTS repuesto_nombre_snapshot varchar(255);

UPDATE orden_trabajo_repuestos otr
SET
  categoria_nombre_snapshot = c.nombre,
  repuesto_nombre_snapshot = r.nombre
FROM repuestos r
INNER JOIN categorias_repuesto c ON c.id = r.categoria_id
WHERE otr.repuesto_id = r.id
  AND (
    otr.categoria_nombre_snapshot IS NULL
    OR otr.repuesto_nombre_snapshot IS NULL
  );

ALTER TABLE orden_trabajo_repuestos
  ADD COLUMN IF NOT EXISTS snapshot_id BIGSERIAL;

ALTER TABLE orden_trabajo_repuestos
  DROP CONSTRAINT IF EXISTS pedido_repuestos_pkey;

ALTER TABLE orden_trabajo_repuestos
  DROP CONSTRAINT IF EXISTS orden_trabajo_repuestos_pkey;

ALTER TABLE orden_trabajo_repuestos
  ADD CONSTRAINT orden_trabajo_repuestos_pkey PRIMARY KEY (snapshot_id);

ALTER TABLE orden_trabajo_repuestos
  ALTER COLUMN repuesto_id DROP NOT NULL;

ALTER TABLE orden_trabajo_repuestos
  DROP CONSTRAINT IF EXISTS pedido_repuestos_repuesto_id_fkey;

ALTER TABLE orden_trabajo_repuestos
  DROP CONSTRAINT IF EXISTS orden_trabajo_repuestos_repuesto_id_fkey;

ALTER TABLE orden_trabajo_repuestos
  ADD CONSTRAINT orden_trabajo_repuestos_repuesto_id_fkey
  FOREIGN KEY (repuesto_id) REFERENCES repuestos(id) ON DELETE SET NULL;

ALTER TABLE orden_trabajo_repuestos
  ADD CONSTRAINT orden_trabajo_repuestos_orden_trabajo_id_repuesto_id_key
  UNIQUE (orden_trabajo_id, repuesto_id);
