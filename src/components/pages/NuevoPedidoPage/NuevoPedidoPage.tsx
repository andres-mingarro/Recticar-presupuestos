import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./NuevoPedidoPage.module.scss";

export function NuevoPedidoPage() {
  return (
    <div className={cn("NuevoPedidoPage", styles.NuevoPedidoPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title="Nuevo pedido"
        description="Esta pantalla quedó preparada para la próxima fase, donde se implementará el formulario completo del presupuesto."
        actions={
          <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      <section className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white/70 p-8 text-sm leading-7 text-[var(--color-foreground-muted)]">
        Acá irá el formulario con cliente, vehículo, motor, checklist de
        trabajos, prioridad, estado y acciones del pedido.
      </section>
    </div>
  );
}
