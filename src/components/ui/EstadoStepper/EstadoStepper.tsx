"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { TrabajoEstado } from "@/lib/types";

const STEPS: Array<{
  value: TrabajoEstado;
  label: string;
  num: string;
  activeBg: string;
  activeText: string;
  isLight: boolean;
}> = [
  {
    value: "presupuesto_entregado",
    label: "Presupuesto entregado",
    num: "1",
    activeBg: "bg-[image:var(--gradient-step-soft)]",
    activeText: "text-[var(--step-soft-ink)]",
    isLight: true,
  },
  {
    value: "aprobado",
    label: "Presupuesto aceptado",
    num: "2",
    activeBg: "bg-[image:var(--gradient-step-mid)]",
    activeText: "text-white",
    isLight: false,
  },
  {
    value: "finalizado",
    label: "Trabajo finalizado",
    num: "3",
    // Verde fijo: "finalizado" tiene que leerse igual en cualquier theme.
    activeBg: "bg-[linear-gradient(135deg,#059669,#34d399)]",
    activeText: "text-white",
    isLight: false,
  },
];

function normalizeStepperValue(value: TrabajoEstado) {
  return value === "pendiente" ? "presupuesto_entregado" : value;
}

function getVisibleSteps(allowFinalizado = true) {
  return allowFinalizado
    ? STEPS
    : STEPS.filter((step) => step.value !== "finalizado");
}

function stepStatus(stepValue: TrabajoEstado, currentValue: TrabajoEstado, visibleSteps: typeof STEPS) {
  const currentIndex = visibleSteps.findIndex((s) => s.value === currentValue);
  const stepIndex = visibleSteps.findIndex((s) => s.value === stepValue);
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

function StepCircle({
  status,
  num,
  light,
}: {
  status: "completed" | "active" | "pending";
  num: string;
  light?: boolean;
}) {
  const base = "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all";

  if (status === "completed") {
    return (
      <span className={cn(base, light ? "border-[var(--step-soft-border)] bg-[var(--step-soft-from)] text-[var(--step-soft-ink)]" : "border-white/40 bg-[var(--color-surface-raised)]/20 text-white")}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className={cn(base, light ? "border-[var(--color-accent)] bg-[var(--color-surface-raised)] text-[var(--color-accent)]" : "border-white bg-[var(--color-surface-raised)]/20 text-white")}>
        <span className="text-xs font-bold">{num}</span>
      </span>
    );
  }
  return (
    <span className={cn(base, "border-[var(--color-border)] bg-transparent text-[var(--text-color-gray)]")}>
      <span className="text-xs font-bold">{num}</span>
    </span>
  );
}

function StepDivider({ light }: { light?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 8 40" className={cn("absolute -right-px top-0 hidden h-full w-2 md:block", light ? "text-[var(--step-soft-to)]" : "text-white/20")} preserveAspectRatio="none">
      <polyline points="0,0 8,20 0,40" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

const CONTAINER = "flex w-full flex-col items-stretch overflow-hidden rounded-2xl border border-[var(--color-border)] md:flex-row";
const BORDER_RIGHT = "border-b border-[var(--color-border)] md:border-b-0 md:border-r";

// ─── Display mode ─────────────────────────────────────────────────────────────

export function EstadoStepperDisplay({ value }: { value: TrabajoEstado }) {
  const normalizedValue = normalizeStepperValue(value);
  const visibleSteps = getVisibleSteps();

  return (
    <div className="EstadoStepperDisplay flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Estado</span>
    <div className={CONTAINER}>
      {visibleSteps.map((step, index) => {
        const status = stepStatus(step.value, normalizedValue, visibleSteps);
        const isLast = index === visibleSteps.length - 1;
        const isPainted = status === "active" || status === "completed";

        return (
          <div
            key={step.value}
            className={cn(
              "relative flex flex-1 items-center gap-3 p-4 text-left text-sm transition sm:px-5",
              "cursor-default",
              isPainted ? step.activeBg : "bg-[var(--color-surface)]",
              !isLast && BORDER_RIGHT
            )}
          >
            <StepCircle status={status} num={step.num} light={step.isLight} />
            <span className={cn("font-semibold leading-tight", isPainted ? step.activeText : "text-[var(--text-color-gray)]")}>
              {step.label}
            </span>
            {!isLast && <StepDivider light={step.isLight} />}
          </div>
        );
      })}
    </div>
    </div>
  );
}

// ─── Form mode ────────────────────────────────────────────────────────────────

type EstadoStepperProps = {
  initialValue: TrabajoEstado;
  name: string;
  allowFinalizado?: boolean;
  form?: string;
  value?: TrabajoEstado;
  onChange?: (value: TrabajoEstado) => void;
};

export function EstadoStepper({ initialValue, name, allowFinalizado, form, value, onChange }: EstadoStepperProps) {
  const [internalSelected, setInternalSelected] = useState<TrabajoEstado>(() => normalizeStepperValue(initialValue));
  const selected = value ?? internalSelected;

  useEffect(() => {
    setInternalSelected(normalizeStepperValue(initialValue));
  }, [initialValue]);

  const normalizedSelected = normalizeStepperValue(selected);
  const visibleSteps = getVisibleSteps(allowFinalizado !== false);

  return (
    <div className="EstadoStepper flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Estado</span>
    <div className={CONTAINER}>
      <input type="hidden" name={name} value={normalizedSelected} form={form} />
      {visibleSteps.map((step, index) => {
        const status = stepStatus(step.value, normalizedSelected, visibleSteps);
        const isLast = index === visibleSteps.length - 1;
        const isPainted = status === "active" || status === "completed";

        return (
          <button
            key={step.value}
            type="button"
            onClick={() => {
              setInternalSelected(step.value);
              onChange?.(step.value);
            }}
            className={cn(
              "relative flex flex-1 items-center gap-3 p-4 text-left text-sm transition sm:px-5",
              "cursor-pointer hover:brightness-95",
              isPainted ? step.activeBg : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)]",
              !isLast && BORDER_RIGHT
            )}
          >
            <StepCircle status={status} num={step.num} light={step.isLight} />
            <span className={cn("font-semibold leading-tight", isPainted ? step.activeText : "text-[var(--text-color-gray)]")}>
              {step.label}
            </span>
            {!isLast && <StepDivider light={step.isLight} />}
          </button>
        );
      })}
    </div>
    </div>
  );
}

// ─── Compat ───────────────────────────────────────────────────────────────────

export type ChangeEstadoActionState = { error: string | null };
