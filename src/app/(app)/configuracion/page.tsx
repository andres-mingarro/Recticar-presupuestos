import Link from "next/link";
import { getSession } from "@/lib/auth";
import { resolveSearchParams } from "@/lib/search-params";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { updateEmpresaConfigAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ConfiguracionFeedback } from "./ConfiguracionFeedback";
import styles from "./ConfiguracionPage.module.scss";

type ConfigCardProps = {
  href: string;
  title: string;
  description: string;
  icon: "settings" | "shieldUser" | "car";
  cta: string;
};

function ConfigCard({ href, title, description, icon, cta }: ConfigCardProps) {
  return (
    <Card as="section" className="space-y-4 rounded-[28px]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff7ed,#ffe7d1)] text-[var(--color-accent)]">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--text-color-gray)]">{description}</p>
      </div>
      <Button as="a" href={href} variant="secondary" className="w-full sm:w-auto">
        {cta}
      </Button>
    </Card>
  );
}

function FieldLabel({
  icon,
  children,
}: {
  icon: "settings" | "phone" | "mail" | "mapPin" | "idCard";
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-color-defult)]">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-current" />
      {children}
    </span>
  );
}

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await getSession();
  const role = session?.role;
  const canManageUsuarios = role === "admin" || role === "superuser";
  const canEditEmpresa = role === "admin" || role === "superuser";
  const params = await resolveSearchParams(searchParams);
  const empresa = await getEmpresaConfig();
  const hasNombreError = params.error === "nombre";

  return (
    <div className={cn("ConfiguracionPage", styles.ConfiguracionPage, "space-y-6")}>
      <PageHeader
        eyebrow="Sistema"
        title="Configuración"
        description="Accedé a la administración técnica, a la gestión de usuarios y a los datos de empresa que salen en el PDF."
      />

      <ConfiguracionFeedback wasSaved={params.saved === "1"} />

      {hasNombreError ? (
        <section className="rounded-[24px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-5 py-4 text-sm text-[var(--color-danger-text)]">
          El nombre de la empresa es obligatorio.
        </section>
      ) : null}

      <div className={cn("ConfiguracionPageContent", styles.ConfiguracionPageContent)}>
        <div className={cn("ConfiguracionPageMain", styles.ConfiguracionPageMain)}>
          <ConfigCard
            href="/informacion-tecnica"
            title="Información técnica"
            description="Gestioná marcas, modelos, motores y vehículos del catálogo técnico."
            icon="car"
            cta="Abrir información técnica"
          />

          {canManageUsuarios ? (
            <ConfigCard
              href="/admin/usuarios"
              title="Usuarios"
              description="Administrá accesos, roles y credenciales de los usuarios del sistema."
              icon="shieldUser"
              cta="Abrir usuarios"
            />
          ) : (
            <Card as="section" className="space-y-4 rounded-[28px] border-dashed">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--text-color-gray)]">
                <Icon name="shieldUser" className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">Usuarios</h2>
                <p className="text-sm leading-6 text-[var(--text-color-gray)]">
                  La administración de usuarios está disponible solo para perfiles `admin` y `superuser`.
                </p>
              </div>
              <Link
                href="/informacion-tecnica"
                className="text-sm font-semibold text-[var(--color-accent)] transition hover:text-[var(--color-accent-strong)]"
              >
                Ir a información técnica
              </Link>
            </Card>
          )}
        </div>

        <aside className={cn("ConfiguracionPageSidebar", styles.ConfiguracionPageSidebar)}>
          <Card as="section" className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Empresa
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                Datos para presupuesto PDF
              </h2>
              <p className="text-sm leading-6 text-[var(--text-color-gray)]">
                Esta información se usa en el encabezado y pie del presupuesto exportado en PDF.
              </p>
            </div>

            <form action={updateEmpresaConfigAction} className="grid gap-4">
              <label className="space-y-2">
                <FieldLabel icon="settings">Nombre de la empresa</FieldLabel>
                <Input name="nombre" defaultValue={empresa.nombre} required disabled={!canEditEmpresa} />
              </label>

              <label className="space-y-2">
                <FieldLabel icon="settings">Bajada</FieldLabel>
                <Input
                  name="tagline"
                  defaultValue={empresa.tagline ?? ""}
                  placeholder="Ej. Rectificación de motores"
                  disabled={!canEditEmpresa}
                />
              </label>

              <label className="space-y-2">
                <FieldLabel icon="phone">Teléfono</FieldLabel>
                <Input name="telefono" defaultValue={empresa.telefono ?? ""} disabled={!canEditEmpresa} />
              </label>

              <label className="space-y-2">
                <FieldLabel icon="mail">Email</FieldLabel>
                <Input name="email" type="email" defaultValue={empresa.email ?? ""} disabled={!canEditEmpresa} />
              </label>

              <label className="space-y-2">
                <FieldLabel icon="mapPin">Dirección</FieldLabel>
                <Input name="direccion" defaultValue={empresa.direccion ?? ""} disabled={!canEditEmpresa} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <FieldLabel icon="mapPin">Ciudad</FieldLabel>
                  <Input name="ciudad" defaultValue={empresa.ciudad ?? ""} disabled={!canEditEmpresa} />
                </label>

                <label className="space-y-2">
                  <FieldLabel icon="mapPin">Provincia</FieldLabel>
                  <Input name="provincia" defaultValue={empresa.provincia ?? ""} disabled={!canEditEmpresa} />
                </label>
              </div>

              <label className="space-y-2">
                <FieldLabel icon="idCard">CUIT</FieldLabel>
                <Input name="cuit" defaultValue={empresa.cuit ?? ""} disabled={!canEditEmpresa} />
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                {canEditEmpresa ? (
                  <Button type="submit" className="w-full sm:w-auto">Guardar datos de empresa</Button>
                ) : (
                  <p className="text-sm text-[var(--text-color-gray)]">
                    Solo `admin` y `superuser` pueden editar estos datos.
                  </p>
                )}
              </div>
            </form>
          </Card>

          <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Salida PDF
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-color-gray)]">
              <li>El nombre, la bajada y el contacto salen en el encabezado del presupuesto.</li>
              <li>La dirección, ciudad, provincia y CUIT ayudan a completar la identidad comercial del taller.</li>
              <li>Los cambios impactan en los próximos PDFs exportados.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
