import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import styles from "./HomePage.module.scss";

export function HomePage() {
  return (
    <div className={cn("HomePage", styles.HomePage, "space-y-8")}>
      <section className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,#0f172a,#1e293b_55%,#9a3412)] px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
              Taller y gestión comercial
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Controlá presupuestos, clientes y seguimiento de trabajos desde un
              solo lugar.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-200">
              Esta primera versión ya deja lista la base técnica de `Recticar
              Presupuestos` para empezar a operar con clientes, pedidos y la
              conexión a Neon.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as="a" href="/clientes">
                Ver clientes
              </Button>
              <Button
                as="a"
                href="/pedidos"
                variant="secondary"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Ver pedidos
              </Button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div>
              <p className="text-sm text-slate-300">Estado del proyecto</p>
              <p className="mt-1 text-2xl font-semibold">Base inicial lista</p>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              <li>Next.js 15 + TypeScript + Tailwind</li>
              <li>Conexión server-side preparada para Neon</li>
              <li>Migraciones SQL y runner listos para ejecutar</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link
          href="/clientes"
          className="group rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.10)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Clientes
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Base de clientes
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">
            Consultá los clientes cargados, buscá por nombre o apellido y dejá
            preparada la navegación para altas y edición.
          </p>
        </Link>

        <Link
          href="/pedidos"
          className="group rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.10)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Pedidos
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Seguimiento de presupuestos
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">
            Filtrá pedidos por estado y prioridad, y dejá lista la base para
            formularios, aprobación y exportación futura.
          </p>
        </Link>
      </section>
    </div>
  );
}
