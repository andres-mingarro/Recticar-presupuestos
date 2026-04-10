"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteFormValues } from "@/lib/types";
import { buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
}: ClienteFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isEditing, setIsEditing] = useState(!startInReadOnly);

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

          {startInReadOnly ? (
            <button
              type="button"
              className={buttonStyles({
                variant: isEditing ? "secondary" : "ghost",
                className: "shrink-0 gap-2",
              })}
              onClick={() => setIsEditing((current) => !current)}
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
            Dirección
          </span>
          <Input
            name="direccion"
            placeholder="Calle, altura, localidad"
            defaultValue={state.values.direccion}
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

        <label
          className={cn(
            "ClienteFormField",
            styles.ClienteFormField,
            "md:col-span-2"
          )}
        >
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
          <button type="submit" className={buttonStyles()} disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </button>
          {cancelMode === "toggle" ? (
            <button
              type="button"
              className={buttonStyles({ variant: "secondary" })}
              onClick={() => setIsEditing(false)}
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
