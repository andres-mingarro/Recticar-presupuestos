"use client";

import { useActionState } from "react";
import type { TechnicalMotor } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { readableRowHoverCls } from "@/components/ui/readableRowHover";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";

export function MotorRow({
  motor,
  index,
  updateAction,
  deleteAction,
  canEdit,
}: {
  motor: TechnicalMotor;
  index: number;
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
}) {
  const deleteFormId = `delete-motor-${motor.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });

  return (
    <div
      className={cn(
        "MotorRow",
        readableRowHoverCls,
        index % 2 === 1 && "bg-[var(--color-surface-alt)]/40"
      )}
    >
      <form
        action={canEdit ? formAction : undefined}
        className="px-2 py-2.5 lg:px-4"
      >
        <input type="hidden" name="motorId" value={motor.id} />
        {canEdit ? (
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="row-header flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-1">
              <input
                type="text"
                name="nombre"
                defaultValue={motor.nombre}
                disabled={isPending}
                className={cn("min-w-0 flex-1", fieldCls)}
              />
              <input
                type="text"
                name="cilindrada"
                defaultValue={motor.cilindrada ?? ""}
                placeholder="Cilindrada"
                disabled={isPending}
                className={cn("w-full sm:w-[180px] lg:w-[160px]", fieldCls)}
              />
            </div>
            <div className="row-footer flex shrink-0 items-center gap-1.5 self-end lg:self-auto">
              <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
                {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
                {isPending ? "Guardando…" : "Guardar"}
              </PulsatingButton>
              <DeleteButton form={deleteFormId} disabled={deletePending} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className={cn("flex-1 truncate", readCls)}>{motor.nombre}</span>
              <span className={cn("flex-1 truncate", readCls, "text-[var(--text-color-gray)]")}>
                {motor.cilindrada ?? "—"}
              </span>
            </div>
          </div>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="motorId" value={motor.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}
