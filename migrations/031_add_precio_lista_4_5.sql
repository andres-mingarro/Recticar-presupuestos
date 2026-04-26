-- Agrega listas de precio 4 y 5 al catálogo de trabajos
ALTER TABLE trabajos
  ADD COLUMN IF NOT EXISTS precio_lista_4 numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_lista_5 numeric(12,2) NOT NULL DEFAULT 0;

-- Agrega columnas de ajuste para las listas 4 y 5
ALTER TABLE ajustes_lista_precios
  ADD COLUMN IF NOT EXISTS ajuste_lista_4 numeric(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ajuste_lista_5 numeric(6,2) NOT NULL DEFAULT 0;
