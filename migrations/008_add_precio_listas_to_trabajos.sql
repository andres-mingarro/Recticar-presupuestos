ALTER TABLE trabajos
  ADD COLUMN IF NOT EXISTS precio_lista_1 numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_lista_2 numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_lista_3 numeric(12, 2) NOT NULL DEFAULT 0;

UPDATE trabajos
SET
  precio_lista_1 = COALESCE(precio_lista_1, precio, 0),
  precio_lista_2 = COALESCE(precio_lista_2, 0),
  precio_lista_3 = COALESCE(precio_lista_3, 0);
