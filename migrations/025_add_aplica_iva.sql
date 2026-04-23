ALTER TABLE ordenes_trabajo
  ADD COLUMN IF NOT EXISTS aplica_iva boolean NOT NULL DEFAULT true;
