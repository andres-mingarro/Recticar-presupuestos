import { templateRows } from "@/lib/db";

export type EmpresaConfig = {
  nombre: string;
  tagline: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  cuit: string | null;
  updatedAt: string;
};

export type EmpresaConfigInput = {
  nombre: string;
  tagline: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  cuit: string;
};

const DEFAULT_EMPRESA_CONFIG: EmpresaConfig = {
  nombre: "Recticar",
  tagline: "Rectificación de motores",
  telefono: "02800 443-6272",
  email: null,
  direccion: "Cadfan Hughes 164",
  ciudad: "Trelew",
  provincia: "Chubut",
  cuit: null,
  updatedAt: new Date(0).toISOString(),
};

export async function getEmpresaConfig() {
  const rows = await templateRows<{
    nombre: string;
    tagline: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    provincia: string | null;
    cuit: string | null;
    updated_at: string;
  }>`
    SELECT
      nombre,
      tagline,
      telefono,
      email,
      direccion,
      ciudad,
      provincia,
      cuit,
      updated_at
    FROM empresa_configuracion
    WHERE id = 1
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return DEFAULT_EMPRESA_CONFIG;

  return {
    nombre: row.nombre,
    tagline: row.tagline,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    ciudad: row.ciudad,
    provincia: row.provincia,
    cuit: row.cuit,
    updatedAt: row.updated_at,
  } satisfies EmpresaConfig;
}

export async function upsertEmpresaConfig(input: EmpresaConfigInput) {
  const rows = await templateRows<{
    nombre: string;
    tagline: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    provincia: string | null;
    cuit: string | null;
    updated_at: string;
  }>`
    INSERT INTO empresa_configuracion (
      id,
      nombre,
      tagline,
      telefono,
      email,
      direccion,
      ciudad,
      provincia,
      cuit,
      updated_at
    )
    VALUES (
      1,
      ${input.nombre},
      ${input.tagline || null},
      ${input.telefono || null},
      ${input.email || null},
      ${input.direccion || null},
      ${input.ciudad || null},
      ${input.provincia || null},
      ${input.cuit || null},
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      tagline = EXCLUDED.tagline,
      telefono = EXCLUDED.telefono,
      email = EXCLUDED.email,
      direccion = EXCLUDED.direccion,
      ciudad = EXCLUDED.ciudad,
      provincia = EXCLUDED.provincia,
      cuit = EXCLUDED.cuit,
      updated_at = now()
    RETURNING
      nombre,
      tagline,
      telefono,
      email,
      direccion,
      ciudad,
      provincia,
      cuit,
      updated_at
  `;

  const row = rows[0];

  return {
    nombre: row.nombre,
    tagline: row.tagline,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    ciudad: row.ciudad,
    provincia: row.provincia,
    cuit: row.cuit,
    updatedAt: row.updated_at,
  } satisfies EmpresaConfig;
}
