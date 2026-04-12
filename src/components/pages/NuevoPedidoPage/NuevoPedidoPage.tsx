import Link from "next/link";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  TrabajoAgrupado,
} from "@/lib/types";
import { PedidoForm, type PedidoFormState } from "@/components/forms/PedidoForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./NuevoPedidoPage.module.scss";

type NuevoPedidoPageProps = {
  action: (
    state: PedidoFormState,
    formData: FormData
  ) => Promise<PedidoFormState>;
  initialState: PedidoFormState;
  initialClienteLabel?: string;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
};

export function NuevoPedidoPage({
  action,
  initialState,
  initialClienteLabel = "",
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
}: NuevoPedidoPageProps) {
  return (
    <div className={cn("NuevoPedidoPage", styles.NuevoPedidoPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title="Nuevo pedido"
        description="Creá un presupuesto nuevo con cliente, vehiculo, motor, checklist de trabajos y estado inicial."
        actions={
          <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      <div
        className={cn(
          "NuevoPedidoPageContent",
          styles.NuevoPedidoPageContent
        )}
      >
        <PedidoForm
          action={action}
          initialState={initialState}
          initialClienteLabel={initialClienteLabel}
          marcas={marcas}
          modelos={modelos}
          motores={motores}
          relations={relations}
          trabajos={trabajos}
        />

        <aside
          className={cn(
            "NuevoPedidoPageSidebar",
            styles.NuevoPedidoPageSidebar
          )}
        >
          <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Reglas clave
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              <li>Un pedido puede guardarse sin cliente solo si queda pendiente.</li>
              <li>Si lo marcás como aprobado, el cliente es obligatorio.</li>
              <li>La fecha de aprobacion se registra automaticamente.</li>
            </ul>
          </section>

          <Card as="section">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Proximo paso
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              Después de crear el pedido, lo vamos a usar como base para la
              edición completa, la aprobacion, el PDF y el link de WhatsApp.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
