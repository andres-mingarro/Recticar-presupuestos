"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SeleccionTecnicaWizard } from "@/components/forms/SeleccionTecnicaWizard";
import { getBrandLogoUrl } from "@/lib/vehicle-logo";
import type { Marca, Modelo, ModeloMotorRelation, Motor } from "@/lib/types";

type Props = {
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  selectedMarca: string;
  selectedModelo: string;
  selectedMotor: string;
  selectedMarcaNombre: string | null;
  selectedModeloNombre: string | null;
  selectedMotorNombre: string | null;
  selectedNumeroSerieMotor: string;
  wizardOpen: boolean;
  wizardInitialStep: number;
  onOpenWizard: (step: number) => void;
  onWizardOpenChange: (open: boolean) => void;
  onSelect: (marcaId: string, modeloId: string, motorId: string) => void;
  onNumeroSerieChange: (value: string) => void;
};

function FieldRow({
  label,
  value,
  hasValue,
  onClick,
}: {
  label: string;
  value: string;
  hasValue: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-[var(--cream-warm)]/40"
    >
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-color-gray)]">
        {label}
      </span>
      <span className={cn(
        "flex items-center gap-1.5 text-sm font-semibold",
        hasValue ? "text-[var(--text-color-defult)]" : "text-[var(--text-color-gray)] italic"
      )}>
        {value}
        <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]/60" />
      </span>
    </button>
  );
}

export function VehiculoMobileSelector({
  marcas,
  modelos,
  motores,
  relations,
  selectedMarca,
  selectedModelo,
  selectedMotor,
  selectedMarcaNombre,
  selectedModeloNombre,
  selectedMotorNombre,
  selectedNumeroSerieMotor,
  wizardOpen,
  wizardInitialStep,
  onOpenWizard,
  onWizardOpenChange,
  onSelect,
  onNumeroSerieChange,
}: Props) {
  const logoUrl = getBrandLogoUrl(selectedMarcaNombre ?? "");
  const hasSelection = Boolean(selectedMarca);

  return (
    <div className="VehiculoMobileSelector space-y-3">
      {hasSelection ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {/* Logo / avatar de marca */}
          <button
            type="button"
            onClick={() => onOpenWizard(0)}
            className="flex w-full cursor-pointer items-center gap-4 border-b border-[var(--color-border)] bg-[linear-gradient(135deg,var(--cream-warm),#fff)] px-4 py-3 transition-colors hover:bg-[var(--peach-soft)]/30"
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={selectedMarcaNombre ?? ""}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 object-contain"
                unoptimized
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-2xl font-bold text-[var(--color-accent)]">
                {(selectedMarcaNombre ?? "?")[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-color-gray)]">Marca</p>
              <p className="truncate text-lg font-bold text-[var(--text-color-defult)]">{selectedMarcaNombre}</p>
            </div>
            <Icon name="edit" className="h-4 w-4 shrink-0 text-[var(--color-accent)]/60" />
          </button>

          {/* Filas modelo / motor */}
          <div className="divide-y divide-[var(--color-border)] px-4">
            <FieldRow
              label="Modelo"
              value={selectedModeloNombre ?? "Sin definir"}
              hasValue={Boolean(selectedModeloNombre)}
              onClick={() => onOpenWizard(1)}
            />
            <FieldRow
              label="Motor"
              value={selectedMotorNombre ?? "Sin definir"}
              hasValue={Boolean(selectedMotorNombre)}
              onClick={() => onOpenWizard(2)}
            />
          </div>
        </div>
      ) : (
        <div className="inline-flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
          <button
            type="button"
            onClick={() => onOpenWizard(0)}
            className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          >
            <span className="flex items-center gap-2 uppercase tracking-wider">
              <Icon name="car" className="h-4 w-4 shrink-0" />
              Seleccionar vehículo
            </span>
            <Icon name="chevronDown" className="h-4 w-4 opacity-80" />
          </button>
        </div>
      )}

      {/* Serie del motor */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--text-color-defult)]">
          Número de serie del motor
        </span>
        <Input
          placeholder="Ej. ABC-1234"
          value={selectedNumeroSerieMotor ?? ""}
          onChange={(e) => onNumeroSerieChange(e.target.value)}
        />
      </label>

      {/* Hidden inputs — envían los valores del wizard al form */}
      <input type="hidden" name="marcaId" value={selectedMarca ?? ""} />
      <input type="hidden" name="modeloId" value={selectedModelo ?? ""} />
      <input type="hidden" name="motorId" value={selectedMotor ?? ""} />

      <SeleccionTecnicaWizard
        marcas={marcas}
        modelos={modelos}
        motores={motores}
        relations={relations}
        open={wizardOpen}
        onOpenChange={onWizardOpenChange}
        initialStep={wizardInitialStep}
        initialMarcaId={selectedMarca}
        initialModeloId={selectedModelo}
        initialMotorId={selectedMotor}
        onSelect={onSelect}
      />
    </div>
  );
}
