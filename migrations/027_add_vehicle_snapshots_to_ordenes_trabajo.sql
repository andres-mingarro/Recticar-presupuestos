ALTER TABLE ordenes_trabajo
  ADD COLUMN IF NOT EXISTS marca_nombre_snapshot varchar(255),
  ADD COLUMN IF NOT EXISTS modelo_nombre_snapshot varchar(255),
  ADD COLUMN IF NOT EXISTS motor_nombre_snapshot varchar(255);
