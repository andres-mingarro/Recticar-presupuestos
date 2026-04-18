ALTER TYPE pedido_prioridad RENAME TO orden_trabajo_prioridad;

ALTER TYPE pedido_estado RENAME TO orden_trabajo_estado;

ALTER TABLE pedidos RENAME TO ordenes_trabajo;

ALTER TABLE pedido_trabajos RENAME TO orden_trabajo_trabajos;

ALTER TABLE pedido_repuestos RENAME TO orden_trabajo_repuestos;

ALTER TABLE orden_trabajo_trabajos
  RENAME COLUMN pedido_id TO orden_trabajo_id;

ALTER TABLE orden_trabajo_repuestos
  RENAME COLUMN pedido_id TO orden_trabajo_id;

ALTER TABLE ordenes_trabajo
  RENAME COLUMN numero_pedido TO numero_trabajo;

ALTER TABLE ordenes_trabajo
  RENAME CONSTRAINT pedidos_aprobado_requiere_cliente TO ordenes_trabajo_aprobado_requiere_cliente;

ALTER INDEX idx_pedidos_numero_pedido RENAME TO idx_ordenes_trabajo_numero_trabajo;
ALTER INDEX idx_pedidos_cliente_id RENAME TO idx_ordenes_trabajo_cliente_id;
ALTER INDEX idx_pedidos_estado_prioridad RENAME TO idx_ordenes_trabajo_estado_prioridad;
ALTER INDEX idx_pedido_trabajos_pedido_id RENAME TO idx_orden_trabajo_trabajos_orden_trabajo_id;
ALTER INDEX idx_pedido_trabajos_trabajo_id RENAME TO idx_orden_trabajo_trabajos_trabajo_id;
ALTER INDEX idx_pedido_repuestos_pedido_id RENAME TO idx_orden_trabajo_repuestos_orden_trabajo_id;
ALTER INDEX idx_pedido_repuestos_repuesto_id RENAME TO idx_orden_trabajo_repuestos_repuesto_id;
