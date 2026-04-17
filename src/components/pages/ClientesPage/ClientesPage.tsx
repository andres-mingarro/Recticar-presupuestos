"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type {
  ClienteListItem,
  ClientePendingPedidoItem,
} from "@/lib/types";
import { SearchForm } from "@/components/search/SearchForm";
import { Pager } from "@/components/pagination/Pager";
import { buttonStyles } from "@/components/ui/Button";
import { PaymentBadge, StatusBadge } from "@/components/ui/Badge";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { Table } from "@/components/ui/Table";
import { getVehicleLabel } from "@/lib/format";
import { ClienteMobileCard } from "@/components/ui/ClienteMobileCard";
import styles from "./ClientesPage.module.scss";

type ClientesPageProps = {
  q: string;
  clientes: ClienteListItem[];
  pendingPedidosByCliente: Record<number, ClientePendingPedidoItem[]>;
  errorMessage: string | null;
  currentPage: number;
  totalClientes: number;
  pageSize: number;
  canEdit: boolean;
};

function normalizePhoneLink(value: string) {
  return value.replace(/\D/g, "");
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
  pendingPedidosByCliente,
  errorMessage,
  currentPage,
  totalClientes,
  pageSize,
  canEdit,
}: ClientesPageProps) {
  const totalPages = Math.max(1, Math.ceil(totalClientes / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageStart = totalClientes === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalClientes);
  const router = useRouter();
  const [panelClientId, setPanelClientId] = useState<number | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelPedidos =
    panelClientId !== null ? pendingPedidosByCliente[panelClientId] ?? [] : [];
  const panelClient = clientes.find((cliente) => cliente.id === panelClientId) ?? null;

  useEffect(() => {
    if (panelClientId === null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsPanelVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [panelClientId]);

  function openPanel(clienteId: number) {
    setPanelClientId(clienteId);
  }

  function closePanel() {
    setIsPanelVisible(false);

    window.setTimeout(() => {
      setPanelClientId(null);
    }, 220);
  }

  return (
    <div className={cn("ClientesPage", styles.ClientesPage, "space-y-6")}>
      <Card as="section">
        <div
          className={cn(
            "ClientesPageHeader",
            styles.ClientesPageHeader
          )}
        >
          <SearchForm
            entity="clientes"
            initialValue={q}
            className={cn(
              "ClientesPageSearch",
              styles.ClientesPageSearch
            )}
          />
          {canEdit ? <Divider className="md:hidden" /> : null}
          {canEdit && <ButtonAdd href="/clientes/nuevo">Nuevo cliente</ButtonAdd>}
        </div>

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

        <Pager
          currentPage={currentPage}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          previousHref={buildClientesHref(q, currentPage - 1)}
          nextHref={buildClientesHref(q, currentPage + 1)}
          summary={
            totalClientes === 0
              ? "Sin resultados"
              : `Mostrando ${pageStart}-${pageEnd} de ${totalClientes} clientes`
          }
          className={cn("ClientesPagePager", styles.ClientesPagePager)}
        />

        {/* Cards mobile */}
        <div className="md:hidden space-y-2">
          {clientes.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-[var(--color-foreground-muted)]">
              No hay clientes para mostrar.
            </p>
          ) : (
            clientes.map((cliente) => (
              <ClienteMobileCard
                key={cliente.id}
                cliente={cliente}
                pendientes={(pendingPedidosByCliente[cliente.id] ?? []).length}
                onPendientesClick={() => openPanel(cliente.id)}
              />
            ))
          )}
        </div>

        <div className="hidden md:block"><Table>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold w-[140px]">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="hash" className="h-4 w-4" />
                    N° Cliente
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="user" className="h-4 w-4" />
                    Nombre completo
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold w-[150px]">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="phone" className="h-4 w-4" />
                    Teléfono
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold w-[150px]">
                  <span className="inline-flex items-center gap-2">
                    <Icon name="clipboard" className="h-4 w-4" />
                    Pendientes
                  </span>
                </th>
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
                    className="group cursor-pointer border-t border-[var(--color-border)] text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-alt)] focus-within:bg-[var(--color-surface-alt)]"
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/clientes/${cliente.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/clientes/${cliente.id}`);
                      }
                    }}
                  >
                    <td className="px-4 py-4 font-semibold">
                      #{cliente.numero_cliente}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "ClientesPageTableLink",
                          styles.ClientesPageTableLink,
                          "transition group-hover:text-[var(--color-accent)]"
                        )}
                      >
                        {cliente.apellido}, {cliente.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {cliente.telefono ? (
                        <a
                          href={`tel:${normalizePhoneLink(cliente.telefono)}`}
                          className="relative z-[1] -mx-1 rounded-md px-1 font-medium text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-4 transition hover:bg-orange-50 hover:text-[var(--color-accent-strong)] hover:decoration-[var(--color-accent-strong)] group-hover:text-[var(--color-accent-strong)] group-hover:decoration-[var(--color-accent-strong)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {cliente.telefono}
                        </a>
                      ) : (
                        "Sin teléfono"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className={cn(
                          "ClientesPagePendingBadge",
                          styles.ClientesPagePendingBadge
                        )}
                        onClick={(event) => {
                          event.stopPropagation();
                          openPanel(cliente.id);
                        }}
                      >
                        <span
                          className={cn(
                            "ClientesPagePendingBadgeCount",
                            styles.ClientesPagePendingBadgeCount
                          )}
                        >
                          {(pendingPedidosByCliente[cliente.id] ?? []).length}
                        </span>
                        <span>Pendientes</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Table></div>

        <Pager
          currentPage={currentPage}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          previousHref={buildClientesHref(q, currentPage - 1)}
          nextHref={buildClientesHref(q, currentPage + 1)}
          summary={
            totalClientes === 0
              ? "Sin resultados"
              : `Mostrando ${pageStart}-${pageEnd} de ${totalClientes} clientes`
          }
          className={cn("ClientesPagePager", styles.ClientesPagePager)}
        />
      </Card>

      {panelClient ? (
        <div
          className={cn(
            "ClientesPagePanelOverlay",
            styles.ClientesPagePanelOverlay,
            isPanelVisible && styles.ClientesPagePanelOverlayVisible
          )}
          onClick={closePanel}
        >
          <aside
            className={cn(
              "ClientesPagePanel",
              styles.ClientesPagePanel,
              isPanelVisible && styles.ClientesPagePanelVisible
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={cn(
                "ClientesPagePanelHeader",
                styles.ClientesPagePanelHeader
              )}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Pendientes
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {panelClient.apellido}, {panelClient.nombre}
                </h3>
              </div>

              <button
                type="button"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                onClick={closePanel}
              >
                <Icon name="x" className="h-4 w-4" />
                Cerrar
              </button>
            </div>

            <div
              className={cn(
                "ClientesPagePanelList",
                styles.ClientesPagePanelList
              )}
            >
              {panelPedidos.length === 0 ? (
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  Este cliente no tiene trabajos pendientes.
                </p>
              ) : (
                panelPedidos.map((pedido) => (
                  <Link
                    key={pedido.id}
                    href={`/pedidos/${pedido.id}`}
                    className={cn(
                      "ClientesPagePanelItem",
                      styles.ClientesPagePanelItem
                    )}
                    onClick={closePanel}
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">
                          <span className="inline-flex items-center gap-2">
                            <Icon name="clipboard" className="h-4 w-4" />
                            Pedido #{pedido.numero_pedido}
                          </span>
                        </p>
                        <PaymentBadge cobrado={pedido.cobrado} />
                      </div>
                      <div>
                        <StatusBadge estado={pedido.estado} />
                      </div>
                      <p className="text-sm text-[var(--color-foreground-muted)]">
                        <span className="inline-flex items-center gap-2">
                          <Icon name="car" className="h-4 w-4" />
                          {getVehicleLabel([
                            pedido.marca_nombre,
                            pedido.modelo_nombre,
                            pedido.motor_nombre,
                          ])}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--color-foreground-subtle)]">
                        Serie: {pedido.numero_serie_motor || "Sin serie"}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
