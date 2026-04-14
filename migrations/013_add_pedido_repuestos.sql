CREATE TABLE IF NOT EXISTS pedido_repuestos (
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  repuesto_id INTEGER NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
  PRIMARY KEY (pedido_id, repuesto_id)
);

CREATE INDEX IF NOT EXISTS idx_pedido_repuestos_pedido_id ON pedido_repuestos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_repuestos_repuesto_id ON pedido_repuestos(repuesto_id);
