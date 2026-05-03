"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { TechnicalModelo, TechnicalMotor, TechnicalVehiculo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { readableRowHoverCls } from "@/components/ui/readableRowHover";
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
    <div
      className={cn(
        "VehiculoRow",
        readableRowHoverCls,
        index % 2 === 1 && "bg-[var(--color-surface-alt)]/40"
      )}
    >
      <form
        action={canEdit ? formAction : undefined}
        className="vehiculos-item px-2 lg:px-4 py-2.5"
      >
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
        {isEditing && canEdit ? (
          <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
            <div className="row-header flex flex-wrap gap-2 w-full">
              <select
                name="modeloId"
                defaultValue={vehiculo.modeloId}
                disabled={isPending}
                className={cn("flex-1  max-w-[100%] lg:max-w-[unset]", fieldCls )}
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
                className={cn( "flex-1 max-w-[100%] lg:max-w-[unset]", fieldCls)}
              >
                {motores.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}{m.cilindrada ? ` (${m.cilindrada})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="row-footer flex items-center gap-1.5">
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className={cn("flex-1 truncate", readCls)}>
                {vehiculo.marcaNombre ? `${vehiculo.marcaNombre} / ` : ""}
                {vehiculo.modeloNombre}
              </span>
              <span className={cn("flex-1 truncate", readCls, "text-[var(--text-color-gray)]")}>
                {vehiculo.motorNombre}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline-ghost"
                onClick={() => setPendingHidden((prev) => !prev)}
                disabled={!canEdit}
                className={cn(
                  "h-auto p-1.5",
                  pendingHidden && "border-[var(--text-color-gray)] text-[var(--text-color-gray)]"
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
          </div>
        )}
      </form>
      <form className="vehiculos-item-edit hidden" id={deleteFormId} action={deleteFormAction} >
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
