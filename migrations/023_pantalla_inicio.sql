ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS pantalla_inicio TEXT NOT NULL DEFAULT 'dashboard'
  CHECK (pantalla_inicio IN ('dashboard', 'trabajos', 'clientes'));
