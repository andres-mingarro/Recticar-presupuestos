import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./NuevoClientePage.module.scss";

export function NuevoClientePage() {
  return (
    <div className={cn("NuevoClientePage", styles.NuevoClientePage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title="Nuevo cliente"
        description="Esta pantalla quedó preparada para la próxima fase, donde se implementará el formulario completo de alta."
        actions={
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      <section className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white/70 p-8 text-sm leading-7 text-[var(--color-foreground-muted)]">
        Acá va a vivir el formulario con nombre, apellido, dirección, teléfono y
        mail, con guardado y redirección al detalle del cliente.
      </section>
    </div>
  );
}
