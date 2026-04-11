"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ClienteDetail, ClientePedidoItem } from "@/lib/types";
import { formatDate, getVehicleLabel } from "@/lib/format";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { ContactBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Table } from "@/components/ui/Table";
import styles from "./ClienteDetailPage.module.scss";

type ClienteDetailPageProps = {
  cliente: ClienteDetail;
  action: (
    state: ClienteFormState,
    formData: FormData
  ) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
  wasUpdated: boolean;
  pedidosVigentes: ClientePedidoItem[];
  pedidosFinalizados: ClientePedidoItem[];
  canEdit: boolean;
};

function PedidoTable({
  title,
  eyebrow,
  emptyMessage,
  pedidos,
}: {
  title: string;
  eyebrow: string;
  emptyMessage: string;
  pedidos: ClientePedidoItem[];
}) {
  return (
    <Card as="section" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          <Icon name="clipboard" className="h-5 w-5" />
          {title}
        </h2>
      </div>

      <Table>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="hash" className="h-4 w-4" />N° Pedido</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="car" className="h-4 w-4" />Vehículo / Motor</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="clipboard" className="h-4 w-4" />Serie</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="gauge" className="h-4 w-4" />Prioridad</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="clipboard" className="h-4 w-4" />Estado</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="calendar" className="h-4 w-4" />Creación</span></th>
              <th className="px-4 py-3 text-right font-semibold"><span className="inline-flex items-center gap-2"><Icon name="arrowRight" className="h-4 w-4" />Detalle</span></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-[var(--color-foreground-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="border-t border-[var(--color-border)] text-[var(--color-foreground)]"
                >
                  <td className="px-4 py-4 font-semibold">#{pedido.numero_pedido}</td>
                  <td className="px-4 py-4">
                    {getVehicleLabel([
                      pedido.marca_nombre,
                      pedido.modelo_nombre,
                      pedido.motor_nombre,
                    ])}
                  </td>
                  <td className="px-4 py-4">
                    {pedido.numero_serie_motor || "Sin serie"}
                  </td>
                  <td className="px-4 py-4">
                    <PriorityBadge prioridad={pedido.prioridad} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge estado={pedido.estado} />
                  </td>
                  <td className="px-4 py-4">{formatDate(pedido.fecha_creacion)}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/pedidos/${pedido.id}`}
                      className={buttonStyles({ variant: "secondary", size: "sm", className: "gap-2" })}
                    >
                      <Icon name="arrowRight" className="h-4 w-4" />
                      Ver pedido
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </Card>
  );
}

export function ClienteDetailPage({
  cliente,
  action,
  initialState,
  wasUpdated,
  pedidosVigentes,
  pedidosFinalizados,
  canEdit,
}: ClienteDetailPageProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className={cn("ClienteDetailPage", styles.ClienteDetailPage, "space-y-6")}>
      <div>
        <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Volver al listado
        </Link>
      </div>

      <Card
        as="section"
        className={cn(
          "ClienteDetailPageTop",
          styles.ClienteDetailPageTop
        )}
      >
        {canEdit && (
          <div
            className={cn(
              "ClienteDetailPageEditButtonWrap",
              styles.ClienteDetailPageEditButtonWrap
            )}
          >
            <button
              type="button"
              className={buttonStyles({
                variant: "primary",
                size: "sm",
                className: "gap-2",
              })}
              aria-expanded={isEditOpen}
              aria-controls="cliente-edit-panel"
              onClick={() => setIsEditOpen((current) => !current)}
            >
              <Icon name="edit" className="h-4 w-4" />
              {isEditOpen ? "Cerrar edicion" : "EDITAR"}
            </button>
          </div>
        )}

        <PageHeader
          eyebrow="Clientes"
          title={`${cliente.apellido}, ${cliente.nombre}`}
          description={
            <div
              className={cn(
                "ClienteDetailPageHeaderData",
                styles.ClienteDetailPageHeaderData
              )}
            >
              <div
                className={cn(
                  "ClienteDetailPageHeaderMeta",
                  styles.ClienteDetailPageHeaderMeta
                )}
              >
                <div className={styles.ClienteDetailPageHeaderMetaCol}>
                  <ContactBadge
                    variant="phone"
                    value={cliente.telefono || "Sin telefono"}
                  />
                  <ContactBadge
                    variant="mail"
                    value={cliente.mail || "Sin mail"}
                  />
                  <ContactBadge
                    variant="address"
                    value={cliente.direccion || "Sin direccion"}
                    mapQuery={[cliente.direccion, cliente.ciudad, cliente.provincia].filter(Boolean).join(", ")}
                  />
                </div>
                <div className={styles.ClienteDetailPageHeaderMetaCol}>
                  <ContactBadge
                    variant="city"
                    value={cliente.ciudad || "Sin ciudad"}
                  />
                  <ContactBadge
                    variant="province"
                    value={cliente.provincia || "Sin provincia"}
                  />
                  <ContactBadge
                    variant="postalCode"
                    value={cliente.cp || "Sin CP"}
                  />
                </div>
              </div>
            </div>
          }
        />

        {wasUpdated ? (
          <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Los datos del cliente se actualizaron correctamente.
          </section>
        ) : null}

        <div
          id="cliente-edit-panel"
          className={cn(
            "ClienteDetailPageAccordion",
            styles.ClienteDetailPageAccordion,
            isEditOpen && styles.ClienteDetailPageAccordionOpen
          )}
          aria-hidden={!isEditOpen}
        >
          <div
            className={cn(
              "ClienteDetailPageAccordionInner",
              styles.ClienteDetailPageAccordionInner
            )}
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Edicion
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Editar datos del cliente
              </h2>
            </div>

            <ClienteForm
              action={action}
              initialState={initialState}
              submitLabel="Guardar cambios"
              pendingLabel="Guardando cambios..."
              cancelLabel="Cancelar"
              cancelMode="toggle"
              isEditing={isEditOpen}
              showEditToggle={false}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      </Card>

      <div
        className={cn(
          "ClienteDetailPageStats",
          styles.ClienteDetailPageStats
        )}
      >
        <div
          className={cn(
            "ClienteDetailPageStatItem",
            styles.ClienteDetailPageStatItem,
            "text-sm text-[var(--color-foreground-muted)]"
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-subtle)]">
            Pedidos vigentes
          </span>
          <span className="text-base font-semibold text-[var(--color-foreground)]">
            {pedidosVigentes.length}
          </span>
        </div>
        <div
          className={cn(
            "ClienteDetailPageStatItem",
            styles.ClienteDetailPageStatItem,
            "text-sm text-[var(--color-foreground-muted)]"
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-subtle)]">
            Finalizados
          </span>
          <span className="text-base font-semibold text-[var(--color-foreground)]">
            {pedidosFinalizados.length}
          </span>
        </div>
      </div>

      <PedidoTable
        eyebrow="Trabajos vigentes"
        title="Pedidos vigentes"
        pedidos={pedidosVigentes}
        emptyMessage="Este cliente no tiene pedidos pendientes ni aprobados."
      />

      <PedidoTable
        eyebrow="Historial"
        title="Pedidos finalizados"
        pedidos={pedidosFinalizados}
        emptyMessage="Todavía no hay pedidos finalizados para este cliente."
      />
    </div>
  );
}
