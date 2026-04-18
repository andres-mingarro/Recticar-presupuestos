"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteDetail, ClientePedidoItem } from "@/lib/types";
import { formatDate, getVehicleLabel } from "@/lib/format";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { Button } from "@/components/ui/Button";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { PedidoMobileCard } from "@/components/ui/PedidoMobileCard";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
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

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>
        {icon}
        {label}
      </span>
      <span className={styles.infoValue}>{children}</span>
    </div>
  );
}

function PedidoTable({
  title,
  eyebrow,
  emptyMessage,
  pedidos,
  footer,
}: {
  title: string;
  eyebrow: string;
  emptyMessage: string;
  pedidos: ClientePedidoItem[];
  footer?: React.ReactNode;
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

      {/* Cards mobile */}
      <div className="md:hidden space-y-2">
        {pedidos.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">{emptyMessage}</p>
        ) : (
          pedidos.map((pedido) => (
            <PedidoMobileCard key={pedido.id} pedido={pedido} showBusinessDays={false} />
          ))
        )}
      </div>

      <div className="hidden md:block"><Table>
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="hash" className="h-4 w-4" />N° Pedido</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="car" className="h-4 w-4" />Vehículo / Motor</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="gauge" className="h-4 w-4" />Prioridad</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4" />Cobro</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="clipboard" className="h-4 w-4" />Estado</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="calendar" className="h-4 w-4" />Creación</span></th>
              <th className="px-4 py-3 text-right font-semibold"><span className="inline-flex items-center gap-2"><Icon name="arrowRight" className="h-4 w-4" />Detalle</span></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[var(--color-foreground-muted)]">
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
                    {getVehicleLabel([pedido.marca_nombre, pedido.modelo_nombre, pedido.motor_nombre])}
                  </td>
                  <td className="px-4 py-4"><PriorityBadge prioridad={pedido.prioridad} className="w-full justify-center" /></td>
                  <td className="px-4 py-4"><PaymentBadge cobrado={pedido.cobrado} /></td>
                  <td className="px-4 py-4"><StatusBadge estado={pedido.estado} /></td>
                  <td className="px-4 py-4">{formatDate(pedido.fecha_creacion)}</td>
                  <td className="px-4 py-4 text-right">
                    <Button as="a" href={`/pedidos/${pedido.id}`} variant="secondary" size="sm"  iconRight={<Icon name="arrowRight" className="h-4 w-4" />}>
                      Ver pedido
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table></div>
      {footer}
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
  const [visibleFinalizados, setVisibleFinalizados] = useState(5);
  const finalizadosVisible = pedidosFinalizados.slice(0, visibleFinalizados);
  const hayMasFinalizados = visibleFinalizados < pedidosFinalizados.length;

  const rawPhone = (cliente.telefono ?? "").replace(/\D/g, "");
  const waNumber = rawPhone.startsWith("54") ? rawPhone : `54${rawPhone}`;

  return (
    <div className={cn("ClienteDetailPage", styles.page, "space-y-6")}>
      <div>
        <Button as="a" href="/clientes" variant="secondary" icon={<Icon name="chevronLeft" className="h-4 w-4" />}>
          Volver al listado
        </Button>
      </div>

      <Card as="section" className={styles.headerCard}>
        {/* Cabecera */}
        <div className={styles.headerTop}>
          <div className={styles.headerTitles}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Cliente #{cliente.numero_cliente}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {cliente.apellido}, {cliente.nombre}
            </h1>
          </div>

          <div className={styles.headerActions}>
            <ButtonAdd className="w-full lg:w-auto" href={`/pedidos/nuevo?clienteId=${cliente.id}`}>
              Nuevo pedido
            </ButtonAdd>
            {/* Stats */}
            <div className={`${styles.stats} hidden lg:flex`}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{pedidosVigentes.length}</span>
                <span className={styles.statLabel}>Vigentes</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>{pedidosFinalizados.length}</span>
                <span className={styles.statLabel}>Finalizados</span>
              </div>
            </div>

            
          </div>
        </div>

        {/* Info de contacto */}
        <div className={`infoGrid ${styles.infoGrid}`}>
          <div className={styles.infoGridRow}>
            <InfoRow label="Teléfono" icon={<Icon name="phone" className="h-3.5 w-3.5" />}>
              {cliente.telefono ? (
                <span className={styles.infoActions}>
                  <Button as="a" href={`tel:${rawPhone}`} variant="link">{cliente.telefono}</Button>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoChip}
                    aria-label="Enviar WhatsApp"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </span>
              ) : (
                <span className={styles.infoEmpty}>Sin teléfono</span>
              )}
            </InfoRow>
            <InfoRow label="Ciudad" icon={<Icon name="mapPin" className="h-3.5 w-3.5" />}>
              {cliente.ciudad || <span className={styles.infoEmpty}>Sin ciudad</span>}
            </InfoRow>
          </div>

          <div className={styles.infoGridRow}>
            <InfoRow label="Email" icon={<Icon name="mail" className="h-3.5 w-3.5" />}>
              {cliente.mail ? (
                <Button as="a" href={`mailto:${cliente.mail}`} variant="link" className="truncate">{cliente.mail}</Button>
              ) : (
                <span className={styles.infoEmpty}>Sin email</span>
              )}
            </InfoRow>
            <InfoRow label="Provincia" icon={<Icon name="mapPin" className="h-3.5 w-3.5" />}>
              {cliente.provincia || <span className={styles.infoEmpty}>Sin provincia</span>}
            </InfoRow>
          </div>

          <div className={styles.infoGridRow}>
            <InfoRow label="Dirección" icon={<Icon name="mapPin" className="h-3.5 w-3.5" />}>
              {cliente.direccion ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([cliente.direccion, cliente.ciudad, cliente.provincia].filter(Boolean).join(", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  {cliente.direccion}
                </a>
              ) : (
                <span className={styles.infoEmpty}>Sin dirección</span>
              )}
            </InfoRow>
            <InfoRow label="Código postal" icon={<Icon name="hash" className="h-3.5 w-3.5" />}>
              {cliente.cp || <span className={styles.infoEmpty}>Sin CP</span>}
            </InfoRow>
          </div>

          <div className={styles.infoGridRow}>
            <InfoRow label="DNI" icon={<Icon name="idCard" className="h-3.5 w-3.5" />}>
              {cliente.dni || <span className={styles.infoEmpty}>Sin DNI</span>}
            </InfoRow>
            <InfoRow label="CUIT" icon={<Icon name="idCard" className="h-3.5 w-3.5" />}>
              {cliente.cuit || <span className={styles.infoEmpty}>Sin CUIT</span>}
            </InfoRow>
          </div>
        </div>

        <div className="grid">
          {canEdit && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="editBtn max-w-[170px] w-full m-auto lg:ml-auto lg:mr-0"
              aria-expanded={isEditOpen}
              aria-controls="cliente-edit-panel"
              onClick={() => setIsEditOpen((v) => !v)}
              icon={<Icon name="edit" className="h-4 w-4" />}
            >
              {isEditOpen ? "Cerrar" : "Editar"}
            </Button>
          )}
        </div>

        {wasUpdated && (
          <section className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Los datos del cliente se actualizaron correctamente.
          </section>
        )}

        {/* Panel de edición */}
        <div
          id="cliente-edit-panel"
          className={cn(styles.accordion, isEditOpen && styles.accordionOpen)}
          aria-hidden={!isEditOpen}
        >
          <div className={styles.accordionInner}>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Edición
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

      <PedidoTable
        eyebrow="Trabajos vigentes"
        title="Pedidos vigentes"
        pedidos={pedidosVigentes}
        emptyMessage="Este cliente no tiene pedidos pendientes ni aprobados."
      />

      <PedidoTable
        eyebrow="Historial"
        title="Pedidos finalizados"
        pedidos={finalizadosVisible}
        emptyMessage="Todavía no hay pedidos finalizados para este cliente."
        footer={hayMasFinalizados ? (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setVisibleFinalizados((v) => v + 5)}
            icon={<Icon name="chevronDown" className="h-4 w-4" />}
          >
            Cargar más finalizados
          </Button>
        ) : undefined}
      />
    </div>
  );
}
