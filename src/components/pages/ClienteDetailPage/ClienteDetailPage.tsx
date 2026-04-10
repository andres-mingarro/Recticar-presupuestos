import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ClienteDetail } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./ClienteDetailPage.module.scss";

type ClienteDetailPageProps = {
  cliente: ClienteDetail;
  action: (
    state: ClienteFormState,
    formData: FormData
  ) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
  wasUpdated: boolean;
};

export function ClienteDetailPage({
  cliente,
  action,
  initialState,
  wasUpdated,
}: ClienteDetailPageProps) {
  return (
    <div className={cn("ClienteDetailPage", styles.ClienteDetailPage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title={`${cliente.apellido}, ${cliente.nombre}`}
        description="Editá los datos de contacto del cliente y mantené su ficha lista para pedidos, seguimiento y comunicación."
        actions={
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      {wasUpdated ? (
        <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Los datos del cliente se actualizaron correctamente.
        </section>
      ) : null}

      <div
        className={cn(
          "ClienteDetailPageGrid",
          styles.ClienteDetailPageGrid
        )}
      >
        <div
          className={cn(
            "ClienteDetailPageMain",
            styles.ClienteDetailPageMain
          )}
        >
          <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <ClienteForm
              action={action}
              initialState={initialState}
              eyebrow="Vista rápida"
              title="Datos actuales"
              submitLabel="Guardar cambios"
              pendingLabel="Guardando cambios..."
              cancelLabel="Cancelar"
              startInReadOnly
              cancelMode="toggle"
            />
          </section>
        </div>

        <section className="space-y-4">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Resumen
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              Alta registrada el {formatDate(cliente.fecha_alta)}. Desde esta
              ficha ya podés mantener actualizados los datos de contacto.
            </p>
          </article>

          <article className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white p-6 text-sm leading-7 text-[var(--color-foreground-muted)] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            Próximo paso: sumar pedidos vigentes e historial de trabajos
            finalizados del cliente en esta misma pantalla.
          </article>
        </section>
      </div>
    </div>
  );
}
