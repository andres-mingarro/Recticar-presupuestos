import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./PedidoDetailPage.module.scss";

export function PedidoDetailPage({ id }: { id: string }) {
  return (
    <div className={cn("PedidoDetailPage", styles.PedidoDetailPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title={`Pedido #${id}`}
        description="Esta vista quedó preparada para editar el presupuesto, administrar sus trabajos y avanzar con aprobación, PDF y WhatsApp."
        actions={
          <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      <section className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white/70 p-8 text-sm leading-7 text-[var(--color-foreground-muted)]">
        En la siguiente fase esta pantalla mostrará el formulario completo del
        pedido y sus acciones asociadas.
      </section>
    </div>
  );
}
