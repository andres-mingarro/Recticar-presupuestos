-- Eliminar columna email de usuarios y promover nombre como nueva PRIMARY KEY
-- usuario_permisos ya tiene columna nombre (migración parcial anterior)

-- 1. Quitar la PK actual de usuarios (email)
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;

-- 2. Eliminar la columna email de usuarios
ALTER TABLE usuarios DROP COLUMN IF EXISTS email;

-- 3. Hacer nombre la nueva PK de usuarios
ALTER TABLE usuarios ADD PRIMARY KEY (nombre);

-- 4. Restaurar FK de usuario_permisos → usuarios.nombre
ALTER TABLE usuario_permisos DROP CONSTRAINT IF EXISTS usuario_permisos_nombre_fkey;
ALTER TABLE usuario_permisos ADD CONSTRAINT usuario_permisos_nombre_fkey
  FOREIGN KEY (nombre) REFERENCES usuarios(nombre) ON DELETE CASCADE;
