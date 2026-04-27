ALTER TABLE orden_trabajo_trabajos
  ADD COLUMN IF NOT EXISTS cantidad integer NOT NULL DEFAULT 1;
