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

export function ClientesPage({
  q,
  clientes,
  errorMessage,
}: ClientesPageProps) {
  return (
    <div className={cn("ClientesPage", styles.ClientesPage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title="Listado de clientes"
        description="Buscá clientes por nombre o apellido y usá este listado como base para la gestión comercial del taller."
        actions={
          <Link href="/clientes/nuevo" className={buttonStyles()}>
            Nuevo cliente
          </Link>
        }
      />

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o apellido"
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
                  className="px-4 py-10 text-center text-[var(--color-foreground-muted)]"
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
                      className="transition hover:text-[var(--color-accent)]"
                    >
                      {cliente.apellido}, {cliente.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {cliente.telefono || "Sin teléfono"}
                  </td>
                  <td className="px-4 py-4">{formatDate(cliente.fecha_alta)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
}
