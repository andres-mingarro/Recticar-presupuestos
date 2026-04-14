CREATE TABLE IF NOT EXISTS categorias_repuesto (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS repuestos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias_repuesto(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0,
  orden INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_repuestos_categoria_id ON repuestos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_repuestos_categoria_orden ON repuestos(categoria_id, orden);
