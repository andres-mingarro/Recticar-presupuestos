"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type { ClienteDetail, ClienteTrabajoItem, TrabajoPrioridad } from "@/lib/types";
import { formatDate, getVehicleLabel } from "@/lib/format";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { Button } from "@/components/ui/Button";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TrabajoMobileCard } from "@/components/ui/TrabajoMobileCard";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Table } from "@/components/ui/Table";
import styles from "./ClienteDetailPage.module.scss";

const PRIORIDAD_ROW_ACCENT: Record<TrabajoPrioridad, string> = {
  alta: "shadow-[inset_3px_0_0_#e11d48]",
  normal: "shadow-[inset_3px_0_0_#0284c7]",
  baja: "shadow-[inset_3px_0_0_#475569]",
};

function TrabajoTable({
  title,
  eyebrow,
  emptyMessage,
  trabajos,
  dimmed = false,
  footer,
}: {
  title: string;
  eyebrow: string;
  emptyMessage: string;
  trabajos: ClienteTrabajoItem[];
  dimmed?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Card as="section" className="space-y-4">
      <div className="flex items-baseline gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">{eyebrow}</p>
        <h2 className="text-base font-semibold text-[var(--text-color-defult)]">{title}</h2>
        <span className="ml-auto text-xs text-[var(--text-color-gray)]">
          {trabajos.length} {trabajos.length === 1 ? "trabajo" : "trabajos"}
        </span>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {trabajos.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-color-gray)]">{emptyMessage}</p>
        ) : (
          trabajos.map((trabajo) => (
            <TrabajoMobileCard key={trabajo.id} trabajo={trabajo} showBusinessDays={false} />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--color-accent)] text-[var(--text-color-gray)]">
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">#</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Vehículo / Motor</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Prioridad</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Cobro</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Estado</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Creación</th>
                <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className={cn(dimmed && "opacity-60")}>
              {trabajos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-color-gray)]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                trabajos.map((trabajo) => (
                  <tr
                    key={trabajo.id}
                    className={cn(
                      "border-t border-[var(--color-border)] transition-colors hover:bg-[var(--cream-warm)]/40",
                      PRIORIDAD_ROW_ACCENT[trabajo.prioridad]
                    )}
                  >
                    <td className="px-3 py-3.5">
                      <span className="font-bold text-[var(--color-accent)]">#</span>
                      <span className="font-bold text-[var(--text-color-defult)]">{trabajo.numero_trabajo}</span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-[var(--text-color-defult)]">
                      {getVehicleLabel([trabajo.marca_nombre, trabajo.modelo_nombre, trabajo.motor_nombre])}
                    </td>
                    <td className="px-3 py-3.5"><PriorityBadge prioridad={trabajo.prioridad} /></td>
                    <td className="px-3 py-3.5"><PaymentBadge cobrado={trabajo.cobrado} /></td>
                    <td className="px-3 py-3.5"><StatusBadge estado={trabajo.estado} compact /></td>
                    <td className="px-3 py-3.5 text-xs text-[var(--text-color-gray)]">{formatDate(trabajo.fecha_creacion)}</td>
                    <td className="px-3 py-3.5 text-right">
                      <Button
                        as="a"
                        href={`/trabajos/${trabajo.id}`}
                        variant="ghost"
                        size="sm"
                        iconRight={<Icon name="arrowRight" className="h-3.5 w-3.5" />}
                      >
                        Ver trabajo
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Table>
      </div>
      {footer}
    </Card>
  );
}

export function ClienteDetailPage({
  cliente,
  action,
  initialState,
  wasCreated,
  wasUpdated,
  trabajosVigentes,
  trabajosFinalizados,
  canEdit,
}: {
  cliente: ClienteDetail;
  action: (state: ClienteFormState, formData: FormData) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
  wasCreated: boolean;
  wasUpdated: boolean;
  trabajosVigentes: ClienteTrabajoItem[];
  trabajosFinalizados: ClienteTrabajoItem[];
  canEdit: boolean;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [visibleFinalizados, setVisibleFinalizados] = useState(5);
  const finalizadosVisible = trabajosFinalizados.slice(0, visibleFinalizados);
  const hayMasFinalizados = visibleFinalizados < trabajosFinalizados.length;
  const lastToastKeyRef = useRef<string | null>(null);

  const rawPhone = (cliente.telefono ?? "").replace(/\D/g, "");
  const waNumber = rawPhone.startsWith("54") ? rawPhone : `54${rawPhone}`;
  const initials = `${cliente.apellido?.[0] ?? ""}${cliente.nombre?.[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    if (!wasCreated && !wasUpdated) return;
    const toastKey = `${cliente.id}:${wasCreated ? "created" : "updated"}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;
    toast.success(
      wasCreated
        ? `Cliente ${cliente.apellido}, ${cliente.nombre} creado correctamente.`
        : `Cliente ${cliente.apellido}, ${cliente.nombre} guardado correctamente.`
    );
    const url = new URL(window.location.href);
    url.searchParams.delete("created");
    url.searchParams.delete("updated");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [cliente.apellido, cliente.id, cliente.nombre, wasCreated, wasUpdated]);

  return (
    <div className={cn("ClienteDetailPage", styles.page, "space-y-5")}>

      {/* ── Cabecera ── */}
      <Card as="section" className={styles.headerCard}>
        <div className={styles.headerTop}>
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--apricot-light),var(--peach-soft))] text-xl font-bold text-[var(--brown-burnt)] shadow-sm">
            {initials}
          </div>

          {/* Títulos + stats */}
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Cliente #{cliente.numero_cliente}
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-[var(--text-color-defult)] truncate">
              {cliente.apellido}, {cliente.nombre}
            </h1>
            {/* Stats inline */}
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-color-gray)]">
                <span className="font-bold text-[var(--text-color-defult)]">{trabajosVigentes.length}</span>
                vigentes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-color-gray)]">
                <span className="font-bold text-[var(--text-color-defult)]">{trabajosFinalizados.length}</span>
                finalizados
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ButtonAdd href={`/trabajos/nuevo?clienteId=${cliente.id}`}>
              Nuevo trabajo
            </ButtonAdd>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={isEditOpen}
                onClick={() => setIsEditOpen((v) => !v)}
                icon={<Icon name="edit" className="h-3.5 w-3.5" />}
              >
                {isEditOpen ? "Cerrar" : "Editar"}
              </Button>
            )}
          </div>
        </div>

        {/* Info de contacto */}
        <div className={styles.infoGrid}>
          <div className={styles.infoGridRow}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="phone" className="h-3.5 w-3.5" />Teléfono</span>
              <span className={styles.infoValue}>
                {cliente.telefono ? (
                  <span className={styles.infoActions}>
                    <Button as="a" href={`tel:${rawPhone}`} variant="link">{cliente.telefono}</Button>
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.infoChip}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </a>
                  </span>
                ) : <span className={styles.infoEmpty}>Sin teléfono</span>}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Ciudad</span>
              <span className={styles.infoValue}>{cliente.ciudad || <span className={styles.infoEmpty}>Sin ciudad</span>}</span>
            </div>
          </div>

          <div className={styles.infoGridRow}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="mail" className="h-3.5 w-3.5" />Email</span>
              <span className={styles.infoValue}>
                {cliente.mail
                  ? <Button as="a" href={`mailto:${cliente.mail}`} variant="link" className="truncate">{cliente.mail}</Button>
                  : <span className={styles.infoEmpty}>Sin email</span>}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Provincia</span>
              <span className={styles.infoValue}>{cliente.provincia || <span className={styles.infoEmpty}>Sin provincia</span>}</span>
            </div>
          </div>

          <div className={styles.infoGridRow}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Dirección</span>
              <span className={styles.infoValue}>
                {cliente.direccion ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([cliente.direccion, cliente.ciudad, cliente.provincia].filter(Boolean).join(", "))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoLink}
                  >
                    {cliente.direccion}
                  </a>
                ) : <span className={styles.infoEmpty}>Sin dirección</span>}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="hash" className="h-3.5 w-3.5" />Código postal</span>
              <span className={styles.infoValue}>{cliente.cp || <span className={styles.infoEmpty}>Sin CP</span>}</span>
            </div>
          </div>

          <div className={styles.infoGridRow}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="idCard" className="h-3.5 w-3.5" />DNI</span>
              <span className={styles.infoValue}>{cliente.dni || <span className={styles.infoEmpty}>Sin DNI</span>}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Icon name="idCard" className="h-3.5 w-3.5" />CUIT</span>
              <span className={styles.infoValue}>{cliente.cuit || <span className={styles.infoEmpty}>Sin CUIT</span>}</span>
            </div>
          </div>
        </div>

        {/* Panel de edición */}
        <div
          id="cliente-edit-panel"
          className={cn(styles.accordion, isEditOpen && styles.accordionOpen)}
          aria-hidden={!isEditOpen}
        >
          <div className={styles.accordionInner}>
            <div className="space-y-1">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Edición</p>
              <h2 className="text-lg font-semibold text-[var(--text-color-defult)]">Editar datos del cliente</h2>
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

      <TrabajoTable
        eyebrow="En curso"
        title="Trabajos vigentes"
        trabajos={trabajosVigentes}
        emptyMessage="Este cliente no tiene trabajos abiertos."
      />

      <TrabajoTable
        eyebrow="Historial"
        title="Trabajos finalizados"
        trabajos={finalizadosVisible}
        emptyMessage="Todavía no hay trabajos finalizados para este cliente."
        dimmed
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
