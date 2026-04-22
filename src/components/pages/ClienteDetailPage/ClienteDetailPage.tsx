"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type { ClienteDetail, ClienteTrabajoItem, TrabajoPrioridad } from "@/lib/types";
import { formatDate, getVehicleLabel } from "@/lib/format";
import Link from "next/link";
import type { ClienteFormState } from "@/components/forms/ClienteForm";
import { useMobileActionsRegister } from "@/components/layout/MobileActions";
import { Button } from "@/components/ui/Button";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TrabajoMobileCard } from "@/components/ui/TrabajoMobileCard";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Table } from "@/components/ui/Table";
import styles from "./ClienteDetailPage.module.scss";

const PROVINCIAS = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut",
  "Ciudad Autónoma de Buenos Aires", "Córdoba", "Corrientes", "Entre Ríos",
  "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

const CIUDADES_CHUBUT = [
  "Trelew", "Comodoro Rivadavia", "Puerto Madryn", "Rawson", "Esquel",
  "Rada Tilly", "Gaiman", "Dolavon", "28 de Julio", "Lago Puelo", "El Hoyo",
  "Epuyén", "Cholila", "Tecka", "Gobernador Costa", "Alto Río Senguer",
  "Río Mayo", "Sarmiento", "Camarones", "Playa Unión", "José de San Martín",
  "Las Plumas", "Paso de Indios", "Los Altares", "Gan Gan", "Gastre",
  "Telsen", "Puerto Pirámides", "Río Pico",
];

function formatDNI(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, digits.length - 3)}.${digits.slice(-3)}`;
  return `${digits.slice(0, digits.length - 6)}.${digits.slice(-6, -3)}.${digits.slice(-3)}`;
}

function formatCUIT(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

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
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2.5 min-w-0 flex-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] shrink-0">{eyebrow}</p>
          <h2 className="text-base font-semibold text-[var(--text-color-defult)] truncate">{title}</h2>
        </div>
        <span className="shrink-0 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs font-bold text-[var(--text-color-gray)]">
          {trabajos.length}
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
              <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] text-[var(--text-color-gray)]">
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] rounded-tl-lg">#</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]">Vehículo / Motor</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]">Prioridad</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]">Cobro</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]">Estado</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]">Creación</th>
                <th className="px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-right rounded-tr-lg">Detalle</th>
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
                      "border-t border-[var(--color-border)] transition-colors hover:bg-[var(--cream-warm)]",
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

function ClienteMobileActions({
  clienteId,
  waNumber,
  hasPhone,
}: {
  clienteId: number;
  waNumber: string;
  hasPhone: boolean;
}) {
  return (
    <>
      <Link
        href={`/trabajos/nuevo?clienteId=${clienteId}`}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))] text-white text-sm font-semibold shadow-sm"
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
        Nuevo trabajo
      </Link>
      {hasPhone && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] text-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
      )}
    </>
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
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [visibleFinalizados, setVisibleFinalizados] = useState(5);
  const finalizadosVisible = trabajosFinalizados.slice(0, visibleFinalizados);
  const hayMasFinalizados = visibleFinalizados < trabajosFinalizados.length;
  const lastToastKeyRef = useRef<string | null>(null);

  const [selectedProvincia, setSelectedProvincia] = useState(initialState.values.provincia || "Chubut");
  const [selectedCiudad, setSelectedCiudad] = useState(initialState.values.ciudad || "Trelew");
  const [dniValue, setDniValue] = useState(initialState.values.dni ?? "");
  const [cuitValue, setCuitValue] = useState(initialState.values.cuit ?? "");
  const esChubut = selectedProvincia === "Chubut";

  const rawPhone = (cliente.telefono ?? "").replace(/\D/g, "");
  const waNumber = rawPhone.startsWith("54") ? rawPhone : `54${rawPhone}`;

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);

  useEffect(() => {
    setSelectedProvincia(state.values.provincia || "Chubut");
    setSelectedCiudad(state.values.ciudad || "Trelew");
  }, [state.values.provincia, state.values.ciudad]);

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

  useMobileActionsRegister(
    <ClienteMobileActions
      clienteId={cliente.id}
      waNumber={waNumber}
      hasPhone={!!cliente.telefono}
    />
  );

  function handleProvinciaChange(provincia: string) {
    setSelectedProvincia(provincia);
    setSelectedCiudad(provincia === "Chubut" ? "Trelew" : "");
  }

  return (
    <div className={cn("ClienteDetailPage", styles.page, "space-y-5")}>

      {/* ── Cabecera ── */}
      <Card as="section" className={styles.headerCard}>
        <form action={formAction} onInput={() => setDirty(true)}>
          <div className={styles.headerTop}>
            {/* Avatar */}
            <div className={styles.avatar}>
              {`${cliente.apellido?.[0] ?? ""}${cliente.nombre?.[0] ?? ""}`.toUpperCase()}
            </div>

            {/* Títulos + stats */}
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Cliente #{cliente.numero_cliente}
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-[var(--text-color-defult)] truncate">
                {cliente.apellido}, {cliente.nombre}
              </h1>
              <div className={styles.stats}>
                <span className={cn(styles.statPill, trabajosVigentes.length > 0 && styles.statPillActive)}>
                  <span className={cn(styles.statPillValue, trabajosVigentes.length > 0 && styles.statPillActiveValue)}>
                    {trabajosVigentes.length}
                  </span>
                  vigentes
                </span>
                <span className={styles.statPill}>
                  <span className={styles.statPillValue}>{trabajosFinalizados.length}</span>
                  finalizados
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="hidden md:block">
                <ButtonAdd href={`/trabajos/nuevo?clienteId=${cliente.id}`}>
                  Nuevo trabajo
                </ButtonAdd>
              </div>
              {/* Editar / Guardar+Cancelar: solo visible en desktop */}
              {canEdit && !isEditOpen && (
                <div className="hidden md:block">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                    icon={<Icon name="edit" className="h-3.5 w-3.5" />}
                  >
                    Editar
                  </Button>
                </div>
              )}
              {canEdit && isEditOpen && (
                <div className="hidden md:flex gap-2">
                  <PulsatingButton
                    type="submit"
                    size="sm"
                    pulsing={dirty && !isPending}
                    disabled={isPending}
                  >
                    {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
                    {isPending ? "Guardando..." : "Guardar"}
                  </PulsatingButton>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(false)}
                    icon={<Icon name="x" className="h-3.5 w-3.5" />}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {state.error ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}

          {/* Info de contacto — modo lectura o edición inline */}
          <div className={cn(styles.infoGrid, isEditOpen && styles.infoGridEditing)}>

            {/* Teléfono + Ciudad */}
            <div className={styles.infoGridRow}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="phone" className="h-3.5 w-3.5" />Teléfono</span>
                {isEditOpen ? (
                  <Input name="telefono" placeholder="Ej. 11 5555 5555" defaultValue={state.values.telefono} className={styles.infoInput} />
                ) : (
                  <span className={styles.infoValue}>
                    {cliente.telefono ? (
                      <span className={styles.infoActions}>
                        <Button as="a" href={`tel:${rawPhone}`} variant="link">{cliente.telefono}</Button>
                        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className={styles.infoChip}>
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                          WhatsApp
                        </a>
                      </span>
                    ) : <span className={styles.infoEmpty}>Sin teléfono</span>}
                  </span>
                )}
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Ciudad</span>
                {isEditOpen ? (
                  esChubut ? (
                    <Select name="ciudad" value={selectedCiudad} onChange={(e) => setSelectedCiudad(e.target.value)} className={styles.infoInput}>
                      {CIUDADES_CHUBUT.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  ) : (
                    <Input name="ciudad" placeholder="Ej. Mendoza" value={selectedCiudad} onChange={(e) => setSelectedCiudad(e.target.value)} className={styles.infoInput} />
                  )
                ) : (
                  <span className={styles.infoValue}>{cliente.ciudad || <span className={styles.infoEmpty}>Sin ciudad</span>}</span>
                )}
              </div>
            </div>

            {/* Email + Provincia */}
            <div className={styles.infoGridRow}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="mail" className="h-3.5 w-3.5" />Email</span>
                {isEditOpen ? (
                  <Input type="email" name="mail" placeholder="cliente@email.com" defaultValue={state.values.mail} className={styles.infoInput} />
                ) : (
                  <span className={styles.infoValue}>
                    {cliente.mail ? (
                      <>
                        <Button as="a" href={`mailto:${cliente.mail}`} variant="link" className={cn("truncate", styles.mailFull)}>{cliente.mail}</Button>
                        <span className={styles.mailShort}>
                          <Button as="a" href={`mailto:${cliente.mail}`} variant="link">Enviar mail</Button>
                          <span className={styles.mailTooltip}>{cliente.mail}</span>
                        </span>
                      </>
                    ) : <span className={styles.infoEmpty}>Sin email</span>}
                  </span>
                )}
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Provincia</span>
                {isEditOpen ? (
                  <Select name="provincia" value={selectedProvincia} onChange={(e) => handleProvinciaChange(e.target.value)} className={styles.infoInput}>
                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                ) : (
                  <span className={styles.infoValue}>{cliente.provincia || <span className={styles.infoEmpty}>Sin provincia</span>}</span>
                )}
              </div>
            </div>

            {/* Dirección + CP */}
            <div className={styles.infoGridRow}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="mapPin" className="h-3.5 w-3.5" />Dirección</span>
                {isEditOpen ? (
                  <Input name="direccion" placeholder="Calle, altura, barrio" defaultValue={state.values.direccion} className={styles.infoInput} />
                ) : (
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
                )}
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="hash" className="h-3.5 w-3.5" />Código postal</span>
                {isEditOpen ? (
                  <Input name="cp" placeholder="Ej. 9100" defaultValue={state.values.cp} className={styles.infoInput} />
                ) : (
                  <span className={styles.infoValue}>{cliente.cp || <span className={styles.infoEmpty}>Sin CP</span>}</span>
                )}
              </div>
            </div>

            {/* DNI + CUIT */}
            <div className={styles.infoGridRow}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="idCard" className="h-3.5 w-3.5" />DNI</span>
                {isEditOpen ? (
                  <Input name="dni" placeholder="29.645.893" value={dniValue} onChange={(e) => setDniValue(formatDNI(e.target.value))} inputMode="numeric" className={styles.infoInput} />
                ) : (
                  <span className={styles.infoValue}>{cliente.dni || <span className={styles.infoEmpty}>Sin DNI</span>}</span>
                )}
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}><Icon name="idCard" className="h-3.5 w-3.5" />CUIT</span>
                {isEditOpen ? (
                  <Input name="cuit" placeholder="20-29645893-8" value={cuitValue} onChange={(e) => setCuitValue(formatCUIT(e.target.value))} inputMode="numeric" className={styles.infoInput} />
                ) : (
                  <span className={styles.infoValue}>{cliente.cuit || <span className={styles.infoEmpty}>Sin CUIT</span>}</span>
                )}
              </div>
            </div>

            {/* Nombre + Apellido (solo en edición) */}
            {isEditOpen && (
              <div className={styles.infoGridRow}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}><Icon name="user" className="h-3.5 w-3.5" />Nombre</span>
                  <Input name="nombre" placeholder="Ej. Juan" defaultValue={state.values.nombre} required className={styles.infoInput} />
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}><Icon name="user" className="h-3.5 w-3.5" />Apellido</span>
                  <Input name="apellido" placeholder="Ej. Pérez" defaultValue={state.values.apellido} required className={styles.infoInput} />
                </div>
              </div>
            )}
          </div>

          {/* Botones mobile: debajo del infoGrid */}
          {canEdit && (
            <div className="md:hidden mt-3 flex gap-2">
              {!isEditOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsEditOpen(true)}
                  icon={<Icon name="edit" className="h-3.5 w-3.5" />}
                >
                  Editar datos
                </Button>
              ) : (
                <>
                  <PulsatingButton
                    type="submit"
                    size="sm"
                    className="flex-1"
                    pulsing={dirty && !isPending}
                    disabled={isPending}
                  >
                    {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
                    {isPending ? "Guardando..." : "Guardar"}
                  </PulsatingButton>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(false)}
                    icon={<Icon name="x" className="h-3.5 w-3.5" />}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )}
        </form>
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
