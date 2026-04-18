"use client";

import { useEffect, useState } from "react";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteFormValues } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import styles from "./ClienteForm.module.scss";

const PROVINCIAS = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autónoma de Buenos Aires",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const CIUDADES_CHUBUT = [
  "Trelew",
  "Comodoro Rivadavia",
  "Puerto Madryn",
  "Rawson",
  "Esquel",
  "Rada Tilly",
  "Gaiman",
  "Dolavon",
  "28 de Julio",
  "Lago Puelo",
  "El Hoyo",
  "Epuyén",
  "Cholila",
  "Tecka",
  "Gobernador Costa",
  "Alto Río Senguer",
  "Río Mayo",
  "Sarmiento",
  "Camarones",
  "Playa Unión",
  "José de San Martín",
  "Las Plumas",
  "Paso de Indios",
  "Los Altares",
  "Gan Gan",
  "Gastre",
  "Telsen",
  "Puerto Pirámides",
  "Río Pico",
];

export type ClienteFormState = {
  error: string | null;
  values: ClienteFormValues;
};

type ClienteFormProps = {
  action: (
    state: ClienteFormState,
    formData: FormData
  ) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
  startInReadOnly?: boolean;
  title?: string;
  description?: string;
  eyebrow?: string;
  cancelMode?: "link" | "toggle";
  isEditing?: boolean;
  showEditToggle?: boolean;
  onCancel?: () => void;
};

export function ClienteForm({
  action,
  initialState,
  submitLabel = "Guardar cliente",
  pendingLabel = "Guardando...",
  cancelHref = "/clientes",
  cancelLabel = "Cancelar",
  startInReadOnly = false,
  title,
  description,
  eyebrow,
  cancelMode = "link",
  isEditing: controlledIsEditing,
  showEditToggle = true,
  onCancel,
}: ClienteFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);
  const [internalIsEditing, setInternalIsEditing] = useState(!startInReadOnly);
  const isEditing = controlledIsEditing ?? internalIsEditing;
  const [selectedProvincia, setSelectedProvincia] = useState(
    initialState.values.provincia || "Chubut"
  );
  const [selectedCiudad, setSelectedCiudad] = useState(
    initialState.values.ciudad || "Trelew"
  );
  const [dniValue, setDniValue] = useState(initialState.values.dni ?? "");
  const [cuitValue, setCuitValue] = useState(initialState.values.cuit ?? "");

  const esChubut = selectedProvincia === "Chubut";

  useEffect(() => {
    const nextProvincia = state.values.provincia || "Chubut";
    const nextCiudad = state.values.ciudad || "Trelew";
    setSelectedProvincia(nextProvincia);
    setSelectedCiudad(nextCiudad);
  }, [state.values.provincia, state.values.ciudad]);

  function handleProvinciaChange(provincia: string) {
    setSelectedProvincia(provincia);
    if (provincia === "Chubut") {
      setSelectedCiudad("Trelew");
    } else {
      setSelectedCiudad("");
    }
  }

  function formatDNI(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `${digits.slice(0, digits.length - 3)}.${digits.slice(-3)}`;
    return `${digits.slice(0, digits.length - 6)}.${digits.slice(-6, -3)}.${digits.slice(-3)}`;
  }

  function formatCUIT(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
  }

  function handleCloseEditing() {
    if (onCancel) {
      onCancel();
      return;
    }

    setInternalIsEditing(false);
  }

  return (
    <form
      action={formAction}
      onInput={() => setDirty(true)}
      className={cn("ClienteForm", styles.ClienteForm, "space-y-6")}
    >
      {title || description || startInReadOnly ? (
        <div
          className={cn(
            "ClienteFormHeader",
            styles.ClienteFormHeader
          )}
        >
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className={cn("text-xl font-semibold tracking-tight text-[var(--color-foreground)]", eyebrow ? "mt-2" : null)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">
                {description}
              </p>
            ) : null}
          </div>

          {startInReadOnly && showEditToggle ? (
            <Button
              type="button"
              variant={isEditing ? "secondary" : "ghost"}
              className="shrink-0"
              onClick={() => setInternalIsEditing((current) => !current)}
              icon={
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              }
            >
              {isEditing ? "Cerrar edición" : "EDITAR"}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn("ClienteFormGrid", styles.ClienteFormGrid)}
      >
        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Nombre
          </span>
          <Input
            name="nombre"
            placeholder="Ej. Juan"
            defaultValue={state.values.nombre}
            required
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Apellido
          </span>
          <Input
            name="apellido"
            placeholder="Ej. Pérez"
            defaultValue={state.values.apellido}
            required
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Teléfono
          </span>
          <Input
            name="telefono"
            placeholder="Ej. 11 5555 5555"
            defaultValue={state.values.telefono}
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Mail
          </span>
          <Input
            type="email"
            name="mail"
            placeholder="cliente@email.com"
            defaultValue={state.values.mail}
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Provincia
          </span>
          <Select
            name="provincia"
            value={selectedProvincia}
            onChange={(event) => handleProvinciaChange(event.target.value)}
            disabled={!isEditing}
          >
            {PROVINCIAS.map((provincia) => (
              <option key={provincia} value={provincia}>
                {provincia}
              </option>
            ))}
          </Select>
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Ciudad
          </span>
          {esChubut ? (
            <Select
              name="ciudad"
              value={selectedCiudad}
              onChange={(event) => setSelectedCiudad(event.target.value)}
              disabled={!isEditing}
            >
              {CIUDADES_CHUBUT.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              name="ciudad"
              placeholder="Ej. Mendoza"
              value={selectedCiudad}
              onChange={(e) => setSelectedCiudad(e.target.value)}
              disabled={!isEditing}
            />
          )}
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Dirección
          </span>
          <Input
            name="direccion"
            placeholder="Calle, altura, barrio"
            defaultValue={state.values.direccion}
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            CP
          </span>
          <Input
            name="cp"
            placeholder="Ej. 9100"
            defaultValue={state.values.cp}
            disabled={!isEditing}
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            DNI
          </span>
          <Input
            name="dni"
            placeholder="29.645.893"
            value={dniValue}
            onChange={(e) => setDniValue(formatDNI(e.target.value))}
            disabled={!isEditing}
            inputMode="numeric"
          />
        </label>

        <label className={cn("ClienteFormField", styles.ClienteFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            CUIT
          </span>
          <Input
            name="cuit"
            placeholder="20-29645893-8"
            value={cuitValue}
            onChange={(e) => setCuitValue(formatCUIT(e.target.value))}
            disabled={!isEditing}
            inputMode="numeric"
          />
        </label>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {isEditing ? (
        <div
          className={cn(
            "ClienteFormActions",
            styles.ClienteFormActions
          )}
        >
          <PulsatingButton type="submit" pulsing={dirty && !isPending} disabled={isPending} className="gap-2">
            {isPending ? <Spinner className="h-4 w-4" /> : null}
            {isPending ? pendingLabel : submitLabel}
          </PulsatingButton>
          {cancelMode === "toggle" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseEditing}
            >
              {cancelLabel}
            </Button>
          ) : (
            <Button as="a" href={cancelHref} variant="secondary">
              {cancelLabel}
            </Button>
          )}
        </div>
      ) : null}
    </form>
  );
}
