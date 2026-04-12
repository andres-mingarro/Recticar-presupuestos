"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteFormValues } from "@/lib/types";
import { buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import styles from "./ClienteForm.module.scss";

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
  const [internalIsEditing, setInternalIsEditing] = useState(!startInReadOnly);
  const isEditing = controlledIsEditing ?? internalIsEditing;
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState(
    initialState.values.provincia || "Chubut"
  );
  const [selectedCiudad, setSelectedCiudad] = useState(
    initialState.values.ciudad || "Trelew"
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dniValue, setDniValue] = useState(initialState.values.dni ?? "");
  const [cuitValue, setCuitValue] = useState(initialState.values.cuit ?? "");

  useEffect(() => {
    const nextProvincia = state.values.provincia || "Chubut";
    const nextCiudad = state.values.ciudad || "Trelew";
    setSelectedProvincia(nextProvincia);
    setSelectedCiudad(nextCiudad);
  }, [state.values.provincia, state.values.ciudad]);

  useEffect(() => {
    let cancelled = false;

    async function loadProvincias() {
      try {
        const response = await fetch("/api/georef/provincias");
        const data = (await response.json()) as {
          provincias?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar las provincias.");
        }

        if (!cancelled) {
          setProvincias(data.provincias ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las provincias."
          );
        }
      }
    }

    loadProvincias();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCiudades() {
      if (!selectedProvincia) {
        setCiudades([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/georef/localidades?provincia=${encodeURIComponent(selectedProvincia)}`
        );
        const data = (await response.json()) as {
          localidades?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar las ciudades.");
        }

        if (cancelled) {
          return;
        }

        const nextCiudades = data.localidades ?? [];
        setCiudades(nextCiudades);

        if (!nextCiudades.includes(selectedCiudad)) {
          if (nextCiudades.includes("Trelew")) {
            setSelectedCiudad("Trelew");
          } else {
            setSelectedCiudad(nextCiudades[0] ?? "");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las ciudades."
          );
        }
      }
    }

    loadCiudades();

    return () => {
      cancelled = true;
    };
  }, [selectedProvincia, selectedCiudad]);

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
            <button
              type="button"
              className={buttonStyles({
                variant: isEditing ? "secondary" : "ghost",
                className: "shrink-0 gap-2",
              })}
              onClick={() => setInternalIsEditing((current) => !current)}
            >
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
              {isEditing ? "Cerrar edición" : "EDITAR"}
            </button>
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
            Ciudad
          </span>
          <Select
            name="ciudad"
            value={selectedCiudad}
            onChange={(event) => setSelectedCiudad(event.target.value)}
            disabled={!isEditing}
          >
            {ciudades.length === 0 ? (
              <option value={selectedCiudad || ""}>
                {selectedCiudad || "Sin ciudades"}
              </option>
            ) : (
              ciudades.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))
            )}
          </Select>
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
            Provincia
          </span>
          <Select
            name="provincia"
            value={selectedProvincia}
            onChange={(event) => setSelectedProvincia(event.target.value)}
            disabled={!isEditing}
          >
            {provincias.length === 0 ? (
              <option value={selectedProvincia || ""}>
                {selectedProvincia || "Sin provincias"}
              </option>
            ) : (
              provincias.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))
            )}
          </Select>
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

      {locationError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {locationError}
        </div>
      ) : null}

      {isEditing ? (
        <div
          className={cn(
            "ClienteFormActions",
            styles.ClienteFormActions
          )}
        >
          <button type="submit" className={buttonStyles()} disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </button>
          {cancelMode === "toggle" ? (
            <button
              type="button"
              className={buttonStyles({ variant: "secondary" })}
              onClick={handleCloseEditing}
            >
              {cancelLabel}
            </button>
          ) : (
            <Link
              href={cancelHref}
              className={buttonStyles({ variant: "secondary" })}
            >
              {cancelLabel}
            </Link>
          )}
        </div>
      ) : null}
    </form>
  );
}
