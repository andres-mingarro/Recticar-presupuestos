"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { TechnicalModelo, TechnicalMotor, TechnicalVehiculo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { type ActionFn, fieldCls, readCls, saveRowBtnCls, RowError, DeleteButton } from "./shared";

export function VehiculoRow({
  vehiculo,
  index,
  modelos,
  motores,
  updateAction,
  deleteAction,
  canEdit,
  hiddenVehiculos,
  confirmVehiculoHiddenChange,
  toggleHiddenAction,
}: {
  vehiculo: TechnicalVehiculo;
  index: number;
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
  hiddenVehiculos: Set<number>;
  confirmVehiculoHiddenChange: (vehiculoId: number, hidden: boolean) => void;
  toggleHiddenAction: ActionFn;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteFormId = `delete-vehiculo-${vehiculo.id}`;
  const toggleHiddenFormId = `toggle-hidden-vehiculo-${vehiculo.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });
  const [toggleState, toggleHiddenFormAction, togglePending] = useActionState(toggleHiddenAction, { error: null });
  const isHidden = hiddenVehiculos.has(vehiculo.id);
  const [pendingHidden, setPendingHidden] = useState(isHidden);

  useEffect(() => {
    setPendingHidden(isHidden);
  }, [isHidden]);

  const prevTogglePending = useRef(togglePending);
  useEffect(() => {
    if (prevTogglePending.current && !togglePending && !toggleState.error) {
      confirmVehiculoHiddenChange(vehiculo.id, pendingHidden);
    }
    prevTogglePending.current = togglePending;
  }, [togglePending, toggleState.error, pendingHidden, confirmVehiculoHiddenChange, vehiculo.id]);

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className={cn("grid items-center gap-2 px-4 py-2.5", isEditing && canEdit ? "md:grid-cols-[1fr_1fr_auto_auto_auto]" : "")}
      >
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
        {isEditing && canEdit ? (
          <>
            <select
              name="modeloId"
              defaultValue={vehiculo.modeloId}
              disabled={isPending}
              className={fieldCls}
            >
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.marcaNombre ? `${m.marcaNombre} / ` : "") + m.nombre}
                </option>
              ))}
            </select>
            <select
              name="motorId"
              defaultValue={vehiculo.motorId}
              disabled={isPending}
              className={fieldCls}
            >
              {motores.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}{m.cilindrada ? ` (${m.cilindrada})` : ""}
                </option>
              ))}
            </select>
            <PulsatingButton size="sm" type="submit" pulsing={!isPending} disabled={isPending} className={saveRowBtnCls}>
              Guardar
            </PulsatingButton>
            <Button
              type="button"
              size="sm"
              variant="outline-ghost"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5">
            <span className={cn("flex-1", readCls)}>
              {vehiculo.marcaNombre ? `${vehiculo.marcaNombre} / ` : ""}
              {vehiculo.modeloNombre}
            </span>
            <span className={cn("flex-1", readCls, "text-[var(--color-foreground-muted)]")}>
              {vehiculo.motorNombre}
            </span>
            <Button
              variant="outline-ghost"
              onClick={() => setPendingHidden((prev) => !prev)}
              disabled={!canEdit}
              className={cn(
                "shrink-0 h-auto p-1.5",
                pendingHidden && "border-[var(--color-foreground-muted)] text-[var(--color-foreground-muted)]"
              )}
              title={canEdit ? (pendingHidden ? "Mostrar vehículo" : "Ocultar vehículo") : "Necesitás permisos para editar"}
              icon={<Icon name={pendingHidden ? "eyeSlash" : "eye"} className="h-4 w-4" />}
            />
            {canEdit && (
              <>
                {pendingHidden !== isHidden && (
                  <PulsatingButton
                    type="submit"
                    form={toggleHiddenFormId}
                    pulsing={!togglePending}
                    disabled={togglePending}
                    className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}
                  >
                    {togglePending ? <Spinner className="h-3.5 w-3.5" /> : null}
                    {togglePending ? "Guardando…" : "Guardar"}
                  </PulsatingButton>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline-ghost"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
                <DeleteButton form={deleteFormId} disabled={deletePending} />
              </>
            )}
          </div>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
      </form>
      <form id={toggleHiddenFormId} action={toggleHiddenFormAction} className="hidden">
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
        <input type="hidden" name="hidden" value={pendingHidden ? "1" : "0"} />
      </form>
      <RowError error={state.error ?? deleteState.error ?? toggleState.error} />
    </div>
  );
}
