import { cn } from "@/lib/cn";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./NuevoClientePage.module.scss";

type NuevoClientePageProps = {
  action: (
    state: ClienteFormState,
    formData: FormData
  ) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
};

const tips = [
  "Completá nombre y apellido para que el cliente ya quede visible en el listado.",
  "Teléfono y mail quedan listos para futuras acciones como WhatsApp y seguimiento.",
  "Después del guardado, la app redirige a la ficha del cliente creado.",
];

export function NuevoClientePage({
  action,
  initialState,
}: NuevoClientePageProps) {
  return (
    <div className={cn("NuevoClientePage", styles.NuevoClientePage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title="Nuevo cliente"
        description="Cargá un nuevo cliente en la base del taller para poder asignarle trabajos, hacer seguimiento y centralizar sus datos de contacto."
        actions={
          <Button as="a" href="/clientes" variant="secondary">
            Volver al listado
          </Button>
        }
      />

      <div
        className={cn(
          "NuevoClientePageContent",
          styles.NuevoClientePageContent
        )}
      >
        <Card as="section">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Datos del cliente
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">
              Esta alta crea el cliente en Neon y lo deja disponible para el
              buscador y para la asignación de trabajos.
            </p>
          </div>

          <ClienteForm action={action} initialState={initialState} />
        </Card>

        <aside
          className={cn(
            "NuevoClientePageSidebar",
            styles.NuevoClientePageSidebar
          )}
        >
          <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Recomendaciones
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <Card as="section">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Siguiente paso
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              Cuando terminemos esta pantalla, el paso natural es completar la
              ficha individual del cliente con edición y sus trabajos asociados.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
