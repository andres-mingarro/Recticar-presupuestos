CREATE TABLE IF NOT EXISTS empresa_configuracion (
  id integer PRIMARY KEY CHECK (id = 1),
  nombre text NOT NULL,
  tagline text,
  telefono text,
  email text,
  direccion text,
  ciudad text,
  provincia text,
  cuit text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO empresa_configuracion (
  id,
  nombre,
  tagline,
  telefono,
  email,
  direccion,
  ciudad,
  provincia,
  cuit
)
VALUES (
  1,
  'Recticar',
  'Rectificación de motores',
  '02800 443-6272',
  NULL,
  'Cadfan Hughes 164',
  'Trelew',
  'Chubut',
  NULL
)
ON CONFLICT (id) DO NOTHING;
