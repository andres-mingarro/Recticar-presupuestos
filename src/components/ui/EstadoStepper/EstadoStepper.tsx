"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/cn";
import type { PedidoEstado } from "@/lib/types";

const STEPS: Array<{ value: PedidoEstado; label: string; num: string }> = [
  { value: "pendiente", label: "Pendiente", num: "01" },
  { value: "aprobado", label: "Aprobado", num: "02" },
  { value: "finalizado", label: "Finalizado", num: "03" },
];

function stepStatus(stepValue: PedidoEstado, currentValue: PedidoEstado) {
  const currentIndex = STEPS.findIndex((s) => s.value === currentValue);
  const stepIndex = STEPS.findIndex((s) => s.value === stepValue);
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

// Shared circle + label render
function StepVisual({
  step,
  status,
  isLast,
}: {
  step: (typeof STEPS)[number];
  status: "completed" | "active" | "pending";
  isLast: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          status === "completed" &&
            "border-[var(--color-accent)] bg-[var(--color-accent)] text-white",
          status === "active" &&
            "border-[var(--color-accent)] bg-transparent text-[var(--color-accent)]",
          status === "pending" &&
            "border-[var(--color-border)] bg-transparent text-[var(--color-foreground-muted)]"
        )}
      >
        {status === "completed" ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <span className="text-xs font-bold">{step.num}</span>
        )}
      </span>

      <span
        className={cn(
          "font-semibold leading-tight",
          status === "active" && "text-[var(--color-accent)]",
          status === "completed" && "text-[var(--color-foreground)]",
          status === "pending" && "text-[var(--color-foreground-muted)]"
        )}
      >
        {step.label}
      </span>

      {!isLast && (
        <svg
          aria-hidden="true"
          viewBox="0 0 8 40"
          className="absolute -right-px top-0 h-full w-2 text-[var(--color-border)]"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,0 8,20 0,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      )}
    </>
  );
}

// ─── Display / Form mode ─────────────────────────────────────────────────────

type EstadoStepperProps =
  | { mode: "display"; value: PedidoEstado }
  | {
      mode: "form";
      initialValue: PedidoEstado;
      name: string;
      allowFinalizado?: boolean;
    };

export function EstadoStepper(props: EstadoStepperProps) {
  const isForm = props.mode === "form";

  const [selected, setSelected] = useState<PedidoEstado>(
    isForm ? props.initialValue : props.value
  );

  const visibleSteps =
    isForm && props.allowFinalizado === false
      ? STEPS.filter((s) => s.value !== "finalizado")
      : STEPS;

  const displayValue = isForm ? selected : props.value;

  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {isForm && <input type="hidden" name={props.name} value={selected} />}

      {visibleSteps.map((step, index) => {
        const status = stepStatus(step.value, displayValue);
        const isLast = index === visibleSteps.length - 1;

        return (
          <button
            key={step.value}
            type={isForm ? "button" : undefined}
            disabled={!isForm}
            onClick={isForm ? () => setSelected(step.value) : undefined}
            className={cn(
              "relative flex flex-1 items-center gap-3 px-5 py-4 text-left text-sm transition",
              isForm && "cursor-pointer hover:bg-[var(--color-surface-alt)]",
              !isForm && "cursor-default",
              status === "active" && "bg-[var(--color-surface-alt)]",
              !isLast && "border-r border-[var(--color-border)]"
            )}
          >
            <StepVisual step={step} status={status} isLast={isLast} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Action mode (one form per step → server action) ─────────────────────────

export type ChangeEstadoActionState = { error: string | null };

type EstadoStepperActionProps = {
  value: PedidoEstado;
  action: (
    prevState: ChangeEstadoActionState,
    formData: FormData
  ) => Promise<ChangeEstadoActionState>;
};

export function EstadoStepperAction({ value, action }: EstadoStepperActionProps) {
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <div className="space-y-2">
      <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {STEPS.map((step, index) => {
          const status = stepStatus(step.value, value);
          const isLast = index === STEPS.length - 1;
          const isCurrent = step.value === value;

          return (
            <form
              key={step.value}
              action={formAction}
              className={cn(
                "relative flex flex-1",
                !isLast && "border-r border-[var(--color-border)]"
              )}
            >
              <input type="hidden" name="estado" value={step.value} />
              <button
                type="submit"
                disabled={isPending || isCurrent}
                className={cn(
                  "relative flex w-full items-center gap-3 px-5 py-4 text-left text-sm transition",
                  !isCurrent && !isPending && "cursor-pointer hover:bg-[var(--color-surface-alt)]",
                  isCurrent && "cursor-default",
                  status === "active" && "bg-[var(--color-surface-alt)]",
                  isPending && "opacity-60"
                )}
              >
                <StepVisual step={step} status={status} isLast={isLast} />
              </button>
            </form>
          );
        })}
      </div>

      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
