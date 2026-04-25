-- Precio del stock del taller por repuesto (se define en el catálogo, se snapshottea al guardar un trabajo)
ALTER TABLE repuestos
  ADD COLUMN IF NOT EXISTS precio_stock INTEGER NOT NULL DEFAULT 0;
