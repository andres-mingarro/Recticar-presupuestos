CREATE TABLE IF NOT EXISTS usuarios (
  email       TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('superuser', 'operador')),
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
