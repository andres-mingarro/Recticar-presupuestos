-- Migración 022: Nuevos roles (super_admin, operario) y tabla de permisos

-- 1. Eliminar el check constraint viejo
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_role_check;

-- 2. Renombrar roles existentes
UPDATE usuarios SET role = 'super_admin' WHERE role IN ('admin', 'superuser');
UPDATE usuarios SET role = 'operario' WHERE role = 'operador';

-- 3. Agregar nuevo check constraint
ALTER TABLE usuarios ADD CONSTRAINT usuarios_role_check CHECK (role IN ('super_admin', 'operario'));

-- 4. Crear tabla de permisos por usuario
CREATE TABLE IF NOT EXISTS usuario_permisos (
  email       TEXT NOT NULL REFERENCES usuarios(email) ON DELETE CASCADE,
  permiso     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (email, permiso)
);

-- 5. Insertar preset por defecto para operarios existentes
INSERT INTO usuario_permisos (email, permiso)
SELECT email, 'trabajos.ver'
FROM usuarios
WHERE role = 'operario'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_permisos (email, permiso)
SELECT email, 'trabajos.crear'
FROM usuarios
WHERE role = 'operario'
ON CONFLICT DO NOTHING;
