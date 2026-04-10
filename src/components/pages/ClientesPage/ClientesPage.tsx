import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ClienteListItem } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { buttonStyles } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import styles from "./ClientesPage.module.scss";

type ClientesPageProps = {
  q: string;
  clientes: ClienteListItem[];
  errorMessage: string | null;
};

function getSearchLabel(q: string) {
  return q ? `Buscando: "${q}"` : "Mostrando todos los clientes";
}

export function ClientesPage({
  q,
  clientes,
  errorMessage,
}: ClientesPageProps) {
  const totalClientes = clientes.length;
  const ultimoCliente = clientes[0] ?? null;

  return (
    <div className={cn("ClientesPage", styles.ClientesPage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title="Listado de clientes"
        description="Organizá la cartera del taller, encontrá clientes rápido y dejá lista la base para sus próximos pedidos, seguimientos y presupuestos."
        actions={
          <Link href="/clientes/nuevo" className={buttonStyles()}>
            Nuevo cliente
          </Link>
        }
      />

      <section
        className={cn(
          "ClientesPageSummaryGrid",
          styles.ClientesPageSummaryGrid
        )}
      >
        <article
          className={cn(
            "ClientesPageSummaryCard",
            styles.ClientesPageSummaryCard,
            "rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Resultados
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {totalClientes}
          </p>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            {totalClientes === 1
              ? "cliente visible en pantalla"
              : "clientes visibles en pantalla"}
          </p>
        </article>

        <article
          className={cn(
            "ClientesPageSummaryCard",
            styles.ClientesPageSummaryCard,
            "rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Contexto
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {getSearchLabel(q)}
          </p>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Usá el buscador para ubicar clientes por nombre o apellido.
          </p>
        </article>

        <article
          className={cn(
            "ClientesPageSummaryCard",
            styles.ClientesPageSummaryCard,
            "rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Último visible
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {ultimoCliente
              ? `#${ultimoCliente.numero_cliente} · ${ultimoCliente.apellido}, ${ultimoCliente.nombre}`
              : "Sin registros"}
          </p>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            {ultimoCliente
              ? `Alta ${formatDate(ultimoCliente.fecha_alta)}`
              : "Todavía no hay clientes cargados."}
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            Buscar cliente
          </h2>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            La búsqueda filtra por nombre y apellido.
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Ej. Pérez o Juan"
            className="ClientesPageSearchInput"
          />
          <button type="submit" className={buttonStyles()}>
            Buscar
          </button>
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Limpiar
          </Link>
        </form>
      </section>

      {errorMessage ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Error al consultar la base de datos: {errorMessage}
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Clientes registrados
            </h2>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Vista principal para consultar la base de clientes del taller.
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <Table>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">N° Cliente</th>
                  <th className="px-4 py-3 font-semibold">Nombre completo</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Alta</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-[var(--color-foreground-muted)]"
                    >
                      No hay clientes para mostrar.
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-t border-[var(--color-border)] text-[var(--color-foreground)]"
                    >
                      <td className="px-4 py-4 font-semibold">
                        #{cliente.numero_cliente}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className={cn(
                            "ClientesPageTableLink",
                            styles.ClientesPageTableLink,
                            "transition hover:text-[var(--color-accent)]"
                          )}
                        >
                          {cliente.apellido}, {cliente.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        {cliente.telefono || "Sin teléfono"}
                      </td>
                      <td className="px-4 py-4">
                        {formatDate(cliente.fecha_alta)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Table>
        </div>

        <div
          className={cn(
            "ClientesPageMobileList",
            styles.ClientesPageMobileList,
            "md:hidden"
          )}
        >
          {clientes.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/80 p-6 text-center text-sm text-[var(--color-foreground-muted)]">
              No hay clientes para mostrar.
            </div>
          ) : (
            clientes.map((cliente) => (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className={cn(
                  "ClientesPageMobileCard",
                  styles.ClientesPageMobileCard,
                  "rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Cliente #{cliente.numero_cliente}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                      {cliente.apellido}, {cliente.nombre}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--color-foreground-muted)]">
                    Ver
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[var(--color-foreground-muted)]">
                  <p>
                    <span className="font-medium text-[var(--color-foreground)]">
                      Teléfono:
                    </span>{" "}
                    {cliente.telefono || "Sin teléfono"}
                  </p>
                  <p>
                    <span className="font-medium text-[var(--color-foreground)]">
                      Alta:
                    </span>{" "}
                    {formatDate(cliente.fecha_alta)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
