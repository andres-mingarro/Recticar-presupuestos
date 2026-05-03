"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import styles from "./TrabajoForm.module.scss";

export function TrabajoFormSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      as="section"
      className={cn("TrabajoFormSection", styles.TrabajoFormSection, className)}
    >
      {children}
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
}) {
  return (
    <div className="SectionHeader">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]",
          !!icon && "inline-flex items-center gap-2"
        )}
      >
        {icon}
        {title}
      </h2>
    </div>
  );
}

export function ObservacionesField({
  withLabel = false,
  defaultValue,
}: {
  withLabel?: boolean;
  defaultValue: string;
}) {
  return (
    <label className={cn("ObservacionesField", "TrabajoFormField", styles.TrabajoFormField)}>
      {withLabel ? (
        <span className="text-sm font-medium text-[var(--text-color-defult)]">
          Observaciones
        </span>
      ) : null}
      <Textarea
        name="observaciones"
        placeholder="Notas adicionales del trabajo, aclaraciones del trabajo o comentarios del cliente."
        defaultValue={defaultValue}
      />
    </label>
  );
}
