import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ClienteListItem } from "@/lib/types";
import { ClienteSearchBox } from "@/components/search/ClienteSearchBox";
import { buttonStyles } from "@/components/ui/Button";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";
import styles from "./ClientesPage.module.scss";

type ClientesPageProps = {
  q: string;
  clientes: ClienteListItem[];
  errorMessage: string | null;
  currentPage: number;
  totalClientes: number;
  pageSize: number;
};

function ClientesPager({
  q,
  currentPage,
  totalPages,
  totalClientes,
  pageStart,
  pageEnd,
  hasPreviousPage,
  hasNextPage,
}: {
  q: string;
  currentPage: number;
  totalPages: number;
  totalClientes: number;
  pageStart: number;
  pageEnd: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}) {
  return (
    <div
      className={cn(
        "ClientesPagePager",
        styles.ClientesPagePager
      )}
    >
      <p className="text-sm text-[var(--color-foreground-muted)]">
        {totalClientes === 0
          ? "Sin resultados"
          : `Mostrando ${pageStart}-${pageEnd} de ${totalClientes} clientes`}
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={buildClientesHref(q, currentPage - 1)}
          aria-disabled={!hasPreviousPage}
          className={buttonStyles({
            variant: "secondary",
            size: "sm",
            className: !hasPreviousPage
              ? "pointer-events-none opacity-50"
              : undefined,
          })}
        >
          Anterior
        </Link>
        <span className="px-2 text-sm text-[var(--color-foreground-muted)]">
          Página {currentPage} de {totalPages}
        </span>
        <Link
          href={buildClientesHref(q, currentPage + 1)}
          aria-disabled={!hasNextPage}
          className={buttonStyles({
            variant: "secondary",
            size: "sm",
            className: !hasNextPage
              ? "pointer-events-none opacity-50"
              : undefined,
          })}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
}

function buildClientesHref(q: string, page: number) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/clientes?${query}` : "/clientes";
}

export function ClientesPage({
  q,
  clientes,
  errorMessage,
  currentPage,
  totalClientes,
  pageSize,
}: ClientesPageProps) {
  const totalPages = Math.max(1, Math.ceil(totalClientes / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageStart = totalClientes === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalClientes);

  return (
    <div className={cn("ClientesPage", styles.ClientesPage, "space-y-6")}>
      <Card as="section">
        <div
          className={cn(
            "ClientesPageHeader",
            styles.ClientesPageHeader
          )}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Clientes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Listado de clientes
            </h1>
          </div>

          <ButtonAdd href="/clientes/nuevo">Nuevo cliente</ButtonAdd>
        </div>

        <form
          className={cn(
            "ClientesPageSearch",
            styles.ClientesPageSearch,
            "mt-6"
          )}
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Busqueda de cliente
            </span>
            <ClienteSearchBox initialValue={q} />
          </label>
          <button type="submit" className={buttonStyles()}>
            Buscar
          </button>
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Limpiar
          </Link>
        </form>
      </Card>

      {errorMessage ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Error al consultar la base de datos: {errorMessage}
        </section>
      ) : null}

      <Card as="section" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Listado de clientes
          </h2>
        </div>

        <ClientesPager
          q={q}
          currentPage={currentPage}
          totalPages={totalPages}
          totalClientes={totalClientes}
          pageStart={pageStart}
          pageEnd={pageEnd}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
        />

        <Table>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">N° Cliente</th>
                <th className="px-4 py-3 font-semibold">Nombre completo</th>
                <th className="px-4 py-3 font-semibold">Teléfono</th>
                <th className="px-4 py-3 font-semibold">Alta</th>
                <th className="px-4 py-3 text-right font-semibold">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                      <span
                        className={cn(
                          "ClientesPageTableLink",
                          styles.ClientesPageTableLink
                        )}
                      >
                        {cliente.apellido}, {cliente.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {cliente.telefono || "Sin teléfono"}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(cliente.fecha_alta)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className={buttonStyles({ variant: "secondary", size: "sm" })}
                      >
                        Detalles
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Table>

        <ClientesPager
          q={q}
          currentPage={currentPage}
          totalPages={totalPages}
          totalClientes={totalClientes}
          pageStart={pageStart}
          pageEnd={pageEnd}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
        />
      </Card>
    </div>
  );
}
