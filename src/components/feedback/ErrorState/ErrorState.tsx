import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

type ErrorStateAction =
  | {
      label: string;
      href: string;
      variant?: Parameters<typeof Button>[0]["variant"];
    }
  | {
      label: string;
      onClick: () => void;
      variant?: Parameters<typeof Button>[0]["variant"];
    };

type ErrorStateProps = {
  code: string;
  title: string;
  description: string;
  hint?: string;
  actions?: ErrorStateAction[];
};

export function ErrorState({
  code,
  title,
  description,
  hint,
  actions = [],
}: ErrorStateProps) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_34%)]" />

      <div className="pointer-events-none absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,209,179,0.45),transparent_68%)] blur-2xl" />

      <Card className="relative z-10 w-full max-w-3xl overflow-hidden border-white/60 bg-white/90 p-0 shadow-[0_32px_100px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="border-b border-[var(--color-border)] px-6 py-8 sm:px-8 sm:py-10 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Recticar
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--cream-warm)] px-4 py-2 text-sm font-semibold text-[var(--brown-burnt)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))] text-white shadow-[0_12px_24px_rgba(234,88,12,0.26)]">
                <Icon name="clipboardList" className="h-4 w-4" />
              </span>
              Estado del sistema
            </div>

            <div className="mt-8">
              <p className="text-6xl font-black tracking-[-0.05em] text-[var(--brown-burnt)] sm:text-7xl">
                {code}
              </p>
              <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-foreground-muted)] sm:text-lg">
                {description}
              </p>
            </div>

            {actions.length > 0 ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {actions.map((action) =>
                  "href" in action ? (
                    <Button
                      key={`${action.label}-${action.href}`}
                      as="a"
                      href={action.href}
                      variant={action.variant ?? "primary"}
                    >
                      {action.label}
                    </Button>
                  ) : (
                    <Button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      variant={action.variant ?? "secondary"}
                    >
                      {action.label}
                    </Button>
                  )
                )}
              </div>
            ) : null}
          </section>

          <aside className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(255,247,237,0.92),rgba(255,255,255,0.98))] px-6 py-8 sm:px-8 sm:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Qué podés hacer
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[var(--color-foreground-muted)] sm:text-base">
                <li className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3">
                  Volver al dashboard o al listado principal.
                </li>
                <li className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3">
                  Reintentar si fue un problema momentáneo.
                </li>
                <li className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3">
                  Revisar la URL si llegaste desde un link externo o viejo.
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-[24px] border border-dashed border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-4 text-sm leading-6 text-[var(--color-warning-text)]">
              <p className="font-semibold">Ayuda rápida</p>
              <p className="mt-2">
                {hint ??
                  "Si el problema sigue apareciendo, conviene revisar el flujo que te trajo hasta esta pantalla y volver a intentar desde el menú principal."}
              </p>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
