import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import { resolveSearchParams } from "@/lib/search-params";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import {
  runPresupuestosCleanupNowAction,
  updateEmpresaBusinessDaysConfigAction,
  updateEmpresaCleanupConfigAction,
  updateEmpresaConfigAction,
} from "./actions";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfiguracionFeedback } from "./ConfiguracionFeedback";
import { cn } from "@/lib/cn";
import styles from "./ConfiguracionPage.module.scss";

function SectionBlock({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="mb-4 border-b border-[var(--color-border)] pb-3">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="text-base font-semibold text-[var(--text-color-defult)]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-[var(--text-color-gray)]">{description}</p>
        )}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-border)] py-2 last:border-0">
      <span className="flex w-28 shrink-0 items-center gap-1.5 text-xs font-medium text-[var(--text-color-gray)]">
        <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; error?: string; cleanup?: string; deleted?: string }>;
}) {
  const { session } = await getSessionWithPermisos();
  const canEdit = isSuperAdmin(session);
  const params = await resolveSearchParams(searchParams);
  const empresa = await getEmpresaConfig();
  const hasNombreError = params.error === "nombre";

  return (
    <div className={cn("ConfiguracionPage", styles.ConfiguracionPage)}>
      <ConfiguracionFeedback
        wasSaved={params.saved === "1"}
        cleanupStatus={typeof params.cleanup === "string" ? params.cleanup : undefined}
        deletedCount={typeof params.deleted === "string" ? Number(params.deleted) : undefined}
      />

      {/* Header compacto */}
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Sistema</p>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-color-defult)]">Configuración</h1>
      </div>

      <div className={cn("ConfiguracionPageGrid", styles.ConfiguracionPageGrid)}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="space-y-4">

          {/* Accesos rápidos */}
          <SectionBlock eyebrow="Módulos" title="Accesos rápidos">
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href="/informacion-tecnica"
                className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 transition hover:border-[var(--color-accent)] hover:shadow-[0_2px_10px_rgba(234,88,12,0.08)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#fff7ed,#ffe7d1)] text-[var(--color-accent)]">
                  <Icon name="car" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-color-defult)]">Información técnica</p>
                  <p className="truncate text-xs text-[var(--text-color-gray)]">Marcas, modelos, motores</p>
                </div>
                <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0 text-[var(--text-color-gray)] transition group-hover:text-[var(--color-accent)]" />
              </a>

              {canEdit ? (
                <a
                  href="/admin/usuarios"
                  className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 transition hover:border-[var(--color-accent)] hover:shadow-[0_2px_10px_rgba(234,88,12,0.08)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#fff7ed,#ffe7d1)] text-[var(--color-accent)]">
                    <Icon name="shieldUser" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-color-defult)]">Usuarios</p>
                    <p className="truncate text-xs text-[var(--text-color-gray)]">Accesos, roles y credenciales</p>
                  </div>
                  <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0 text-[var(--text-color-gray)] transition group-hover:text-[var(--color-accent)]" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2.5 opacity-40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-[var(--text-color-gray)]">
                    <Icon name="shieldUser" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-color-defult)]">Usuarios</p>
                    <p className="text-[10px] text-[var(--text-color-gray)]">Solo super admin</p>
                  </div>
                </div>
              )}
            </div>
          </SectionBlock>

          {/* Semáforo días hábiles + Limpieza automática lado a lado */}
          <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1.6fr]">
          {/* Semáforo días hábiles */}
          <SectionBlock
            eyebrow="Días hábiles"
            title="Semáforo del listado de trabajos"
            description="Definí hasta qué cantidad de días el indicador se muestra verde o naranja. Por encima del umbral naranja pasa a rojo."
          >
            <form action={updateEmpresaBusinessDaysConfigAction} className="flex h-full flex-col">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-color-gray)]">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Verde hasta
                    </span>
                    <Input
                      type="number"
                      name="diasHabilesUmbralVerde"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      defaultValue={empresa.diasHabilesUmbralVerde}
                      disabled={!canEdit}
                      className="h-8 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-color-gray)]">
                      <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                      Naranja hasta
                    </span>
                    <Input
                      type="number"
                      name="diasHabilesUmbralNaranja"
                      min={empresa.diasHabilesUmbralVerde}
                      step="1"
                      inputMode="numeric"
                      defaultValue={empresa.diasHabilesUmbralNaranja}
                      disabled={!canEdit}
                      className="h-8 text-sm"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-[var(--color-surface-alt)] px-3 py-2 text-xs text-[var(--text-color-gray)]">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    0–{empresa.diasHabilesUmbralVerde}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                    {empresa.diasHabilesUmbralNaranja > empresa.diasHabilesUmbralVerde
                      ? `${empresa.diasHabilesUmbralVerde + 1}–${empresa.diasHabilesUmbralNaranja}`
                      : "Sin tramo naranja"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                    +{empresa.diasHabilesUmbralNaranja + 1}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex justify-end border-t border-[var(--color-border)] pt-3">
                {canEdit && (
                  <Button type="submit" size="sm" className="w-full sm:w-auto">
                    Guardar umbrales
                  </Button>
                )}
              </div>
            </form>
          </SectionBlock>

          {/* Limpieza automática */}
          <SectionBlock
            eyebrow="Limpieza automática"
            title="Presupuestos sin respuesta"
            description="Borra automáticamente presupuestos entregados que el cliente nunca confirmó."
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
              <form action={updateEmpresaCleanupConfigAction} className="flex h-full flex-col">
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5">
                    <input
                      type="checkbox"
                      name="autoEliminarPresupuestosEntregados"
                      value="true"
                      defaultChecked={empresa.autoEliminarPresupuestosEntregados}
                      disabled={!canEdit}
                      className="mt-0.5 h-4 w-4 rounded accent-[var(--color-accent)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[var(--text-color-defult)]">Eliminar automáticamente</span>
                      <span className="block text-xs leading-5 text-[var(--text-color-gray)]">Si está desactivado, la tarea mensual no borra trabajos aunque estén vencidos.</span>
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--text-color-gray)] whitespace-nowrap">Meses antes de borrar</span>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      name="mesesRetencionPresupuestoEntregado"
                      defaultValue={empresa.mesesRetencionPresupuestoEntregado}
                      disabled={!canEdit}
                      className="h-8 w-20 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-auto flex justify-end border-t border-[var(--color-border)] pt-3">
                  {canEdit && (
                    <Button type="submit" size="sm" className="w-full sm:w-auto">
                      Guardar
                    </Button>
                  )}
                </div>
              </form>

              <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.7),rgba(255,255,255,0.9))] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Mantenimiento</p>
                <p className="text-sm font-semibold text-[var(--text-color-defult)]">Ejecutar ahora</p>
                {empresa.ultimaEjecucionLimpieza ? (
                  <p className="text-xs leading-4 text-[var(--text-color-gray)]">
                    Última: {new Date(empresa.ultimaEjecucionLimpieza).toLocaleString("es-AR")}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--text-color-gray)]">Sin ejecuciones previas.</p>
                )}
                {canEdit ? (
                  <form action={runPresupuestosCleanupNowAction} className="mt-auto pt-1">
                    <Button type="submit" variant="secondary" size="sm" className="w-full">
                      Ejecutar limpieza
                    </Button>
                  </form>
                ) : (
                  <p className="mt-auto text-[10px] text-[var(--text-color-gray)]">Solo super admin.</p>
                )}
              </div>
            </div>
          </SectionBlock>
          </div>{/* fin grid días hábiles + limpieza */}
        </div>

        {/* ── SIDEBAR: datos empresa ── */}
        <div>
          <SectionBlock
            eyebrow="Empresa"
            title="Datos para PDF"
            description="Aparecen en el encabezado y pie del presupuesto exportado."
          >
            {hasNombreError && (
              <div className="mb-3 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-xs text-[var(--color-danger-text)]">
                El nombre de la empresa es obligatorio.
              </div>
            )}
            <form action={updateEmpresaConfigAction} className="flex h-full flex-col">
              <div>
                <FieldRow label="Nombre" icon="settings">
                  <Input name="nombre" defaultValue={empresa.nombre} required disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Bajada" icon="settings">
                  <Input name="tagline" defaultValue={empresa.tagline ?? ""} placeholder="Rectificación de motores" disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Teléfono" icon="phone">
                  <Input name="telefono" defaultValue={empresa.telefono ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Email" icon="mail">
                  <Input name="email" type="email" defaultValue={empresa.email ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Dirección" icon="mapPin">
                  <Input name="direccion" defaultValue={empresa.direccion ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Ciudad" icon="mapPin">
                  <Input name="ciudad" defaultValue={empresa.ciudad ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="Provincia" icon="mapPin">
                  <Input name="provincia" defaultValue={empresa.provincia ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
                <FieldRow label="CUIT" icon="idCard">
                  <Input name="cuit" defaultValue={empresa.cuit ?? ""} disabled={!canEdit} className="h-8 text-xs" />
                </FieldRow>
              </div>
              <div className="mt-auto border-t border-[var(--color-border)] pt-3">
                {canEdit ? (
                  <Button type="submit" className="w-full">Guardar datos de empresa</Button>
                ) : (
                  <p className="text-xs text-[var(--text-color-gray)]">Solo super admin puede editar.</p>
                )}
              </div>
            </form>
          </SectionBlock>
        </div>

      </div>
    </div>
  );
}
