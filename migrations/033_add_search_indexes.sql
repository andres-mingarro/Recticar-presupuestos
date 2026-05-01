CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm
  ON clientes
  USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_apellido_trgm
  ON clientes
  USING gin (apellido gin_trgm_ops);
