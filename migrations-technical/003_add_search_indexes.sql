CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_marcas_nombre_trgm
  ON marcas
  USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_modelos_nombre_trgm
  ON modelos
  USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_motores_nombre_trgm
  ON motores
  USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_motores_cilindrada_trgm
  ON motores
  USING gin (cilindrada gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_modelos_hidden_marca
  ON modelos (hidden, marca_id);

CREATE INDEX IF NOT EXISTS idx_vehiculos_hidden_modelo_motor
  ON vehiculos (hidden, modelo_id, motor_id);
