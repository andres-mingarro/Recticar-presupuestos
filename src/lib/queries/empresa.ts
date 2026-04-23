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
  autoEliminarPresupuestosEntregados: boolean;
  mesesRetencionPresupuestoEntregado: number;
  ultimaEjecucionLimpieza: string | null;
  diasHabilesUmbralVerde: number;
  diasHabilesUmbralNaranja: number;
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
  autoEliminarPresupuestosEntregados: boolean;
  mesesRetencionPresupuestoEntregado: number;
  diasHabilesUmbralVerde: number;
  diasHabilesUmbralNaranja: number;
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
  autoEliminarPresupuestosEntregados: false,
  mesesRetencionPresupuestoEntregado: 3,
  ultimaEjecucionLimpieza: null,
  diasHabilesUmbralVerde: 5,
  diasHabilesUmbralNaranja: 10,
  updatedAt: new Date(0).toISOString(),
};

export function normalizeBusinessDaysThresholds({
  verde,
  naranja,
}: {
  verde: number;
  naranja: number;
}) {
  const diasHabilesUmbralVerde = Math.max(0, Math.floor(Number.isFinite(verde) ? verde : 5));
  const diasHabilesUmbralNaranja = Math.max(
    diasHabilesUmbralVerde,
    Math.floor(Number.isFinite(naranja) ? naranja : 10)
  );

  return { diasHabilesUmbralVerde, diasHabilesUmbralNaranja };
}

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
    auto_eliminar_presupuestos_entregados: boolean | null;
    meses_retencion_presupuesto_entregado: number | null;
    ultima_ejecucion_limpieza: string | null;
    dias_habiles_umbral_verde: number | null;
    dias_habiles_umbral_naranja: number | null;
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
      auto_eliminar_presupuestos_entregados,
      meses_retencion_presupuesto_entregado,
      ultima_ejecucion_limpieza,
      dias_habiles_umbral_verde,
      dias_habiles_umbral_naranja,
      updated_at
    FROM empresa_configuracion
    WHERE id = 1
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return DEFAULT_EMPRESA_CONFIG;

  const businessDaysThresholds = normalizeBusinessDaysThresholds({
    verde: Number(row.dias_habiles_umbral_verde ?? DEFAULT_EMPRESA_CONFIG.diasHabilesUmbralVerde),
    naranja: Number(row.dias_habiles_umbral_naranja ?? DEFAULT_EMPRESA_CONFIG.diasHabilesUmbralNaranja),
  });

  return {
    nombre: row.nombre,
    tagline: row.tagline,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    ciudad: row.ciudad,
    provincia: row.provincia,
    cuit: row.cuit,
    autoEliminarPresupuestosEntregados: Boolean(row.auto_eliminar_presupuestos_entregados),
    mesesRetencionPresupuestoEntregado: Math.max(1, Number(row.meses_retencion_presupuesto_entregado ?? 3)),
    ultimaEjecucionLimpieza: row.ultima_ejecucion_limpieza,
    ...businessDaysThresholds,
    updatedAt: row.updated_at,
  } satisfies EmpresaConfig;
}

export async function upsertEmpresaConfig(input: EmpresaConfigInput) {
  const businessDaysThresholds = normalizeBusinessDaysThresholds({
    verde: input.diasHabilesUmbralVerde,
    naranja: input.diasHabilesUmbralNaranja,
  });

  const rows = await templateRows<{
    nombre: string;
    tagline: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    provincia: string | null;
    cuit: string | null;
    auto_eliminar_presupuestos_entregados: boolean;
    meses_retencion_presupuesto_entregado: number;
    ultima_ejecucion_limpieza: string | null;
    dias_habiles_umbral_verde: number;
    dias_habiles_umbral_naranja: number;
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
      auto_eliminar_presupuestos_entregados,
      meses_retencion_presupuesto_entregado,
      ultima_ejecucion_limpieza,
      dias_habiles_umbral_verde,
      dias_habiles_umbral_naranja,
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
      ${input.autoEliminarPresupuestosEntregados},
      ${Math.max(1, input.mesesRetencionPresupuestoEntregado)},
      NULL,
      ${businessDaysThresholds.diasHabilesUmbralVerde},
      ${businessDaysThresholds.diasHabilesUmbralNaranja},
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
      auto_eliminar_presupuestos_entregados = EXCLUDED.auto_eliminar_presupuestos_entregados,
      meses_retencion_presupuesto_entregado = EXCLUDED.meses_retencion_presupuesto_entregado,
      dias_habiles_umbral_verde = EXCLUDED.dias_habiles_umbral_verde,
      dias_habiles_umbral_naranja = EXCLUDED.dias_habiles_umbral_naranja,
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
      auto_eliminar_presupuestos_entregados,
      meses_retencion_presupuesto_entregado,
      ultima_ejecucion_limpieza,
      dias_habiles_umbral_verde,
      dias_habiles_umbral_naranja,
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
    autoEliminarPresupuestosEntregados: row.auto_eliminar_presupuestos_entregados,
    mesesRetencionPresupuestoEntregado: Number(row.meses_retencion_presupuesto_entregado),
    ultimaEjecucionLimpieza: row.ultima_ejecucion_limpieza,
    diasHabilesUmbralVerde: row.dias_habiles_umbral_verde,
    diasHabilesUmbralNaranja: row.dias_habiles_umbral_naranja,
    updatedAt: row.updated_at,
  } satisfies EmpresaConfig;
}

export async function updateEmpresaCleanupLastRun(isoDate: string) {
  await templateRows`
    UPDATE empresa_configuracion
    SET ultima_ejecucion_limpieza = ${isoDate}::timestamptz
    WHERE id = 1
  `;
}
