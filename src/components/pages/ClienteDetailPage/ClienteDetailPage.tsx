import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./ClienteDetailPage.module.scss";

export function ClienteDetailPage({ id }: { id: string }) {
  return (
    <div className={cn("ClienteDetailPage", styles.ClienteDetailPage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title={`Cliente #${id}`}
        description="Esta vista quedó preparada para mostrar datos editables, pedidos vigentes e historial finalizado del cliente."
        actions={
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      <section className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white/70 p-8 text-sm leading-7 text-[var(--color-foreground-muted)]">
        En la siguiente fase esta pantalla mostrará los datos del cliente, sus
        trabajos pendientes y el historial de pedidos finalizados.
      </section>
    </div>
  );
}
