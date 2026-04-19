ALTER TABLE orden_trabajo_trabajos
  ADD COLUMN IF NOT EXISTS categoria_nombre_snapshot varchar(255),
  ADD COLUMN IF NOT EXISTS trabajo_nombre_snapshot varchar(255),
  ADD COLUMN IF NOT EXISTS precio_snapshot numeric;

UPDATE orden_trabajo_trabajos ott
SET
  categoria_nombre_snapshot = c.nombre,
  trabajo_nombre_snapshot = t.nombre,
  precio_snapshot = CASE ot.lista_precio
    WHEN 3 THEN t.precio_lista_3
    WHEN 2 THEN t.precio_lista_2
    ELSE t.precio_lista_1
  END
FROM ordenes_trabajo ot
INNER JOIN trabajos t ON TRUE
INNER JOIN categorias_trabajo c ON c.id = t.categoria_id
WHERE ott.orden_trabajo_id = ot.id
  AND t.id = ott.trabajo_id
  AND (
    ott.categoria_nombre_snapshot IS NULL
    OR ott.trabajo_nombre_snapshot IS NULL
    OR ott.precio_snapshot IS NULL
  );

ALTER TABLE orden_trabajo_trabajos
  ALTER COLUMN trabajo_id DROP NOT NULL;

ALTER TABLE orden_trabajo_trabajos
  DROP CONSTRAINT IF EXISTS pedido_trabajos_trabajo_id_fkey;

ALTER TABLE orden_trabajo_trabajos
  DROP CONSTRAINT IF EXISTS orden_trabajo_trabajos_trabajo_id_fkey;

ALTER TABLE orden_trabajo_trabajos
  ADD CONSTRAINT orden_trabajo_trabajos_trabajo_id_fkey
  FOREIGN KEY (trabajo_id) REFERENCES trabajos(id) ON DELETE SET NULL;
