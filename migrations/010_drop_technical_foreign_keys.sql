ALTER TABLE pedidos
  DROP CONSTRAINT IF EXISTS pedidos_marca_id_fkey,
  DROP CONSTRAINT IF EXISTS pedidos_modelo_id_fkey,
  DROP CONSTRAINT IF EXISTS pedidos_motor_id_fkey;
