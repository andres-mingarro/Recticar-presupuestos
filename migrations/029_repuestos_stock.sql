-- Stock en taller por repuesto
ALTER TABLE repuestos
  ADD COLUMN IF NOT EXISTS stock_habilitado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_cantidad   INTEGER NOT NULL DEFAULT 0;

-- Stock propio y faltante de proveedor por repuesto en un trabajo
-- precio_stock: precio unitario de las unidades que salen del stock del taller
-- cantidad_stock: cuántas unidades salen del stock del taller
-- precio (ya existente) = precio unitario del proveedor (unidades que faltan del stock)
-- cantidad (ya existente) = total de unidades (stock + proveedor)
-- total = precio_stock * cantidad_stock + precio * (cantidad - cantidad_stock)
ALTER TABLE orden_trabajo_repuestos
  ADD COLUMN IF NOT EXISTS precio_stock   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cantidad_stock INTEGER NOT NULL DEFAULT 0;
