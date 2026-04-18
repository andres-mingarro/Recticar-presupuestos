"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type {
  TechnicalMarca,
  TechnicalModelo,
  TechnicalMotor,
  TechnicalVehiculo,
} from "@/lib/types";
import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import styles from "./InformacionTecnicaPage.module.scss";
import { type ActionFn, ColHeaders } from "./components/shared";
import { buildSectionHref } from "./components/buildSectionHref";
import { SectionTabs } from "./components/SectionTabs";
import { ContentCard } from "./components/ContentCard";
import { MarcaRow } from "./components/MarcaRow";
import { ModeloRow } from "./components/ModeloRow";
import { MotorRow } from "./components/MotorRow";
import { VehiculoRow } from "./components/VehiculoRow";
import { AddMarcaForm } from "./components/AddMarcaForm";
import { AddModeloForm } from "./components/AddModeloForm";
import { AddMotorForm } from "./components/AddMotorForm";
import { AddVehiculoForm } from "./components/AddVehiculoForm";

// buildSectionHref is re-exported for use in server components / pages if needed
export { buildSectionHref };

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

type Props = {
  activeSection: TechnicalSection;
  q: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  sectionCounts: Record<TechnicalSection, number>;
  marcas: TechnicalMarca[];
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  vehiculos: TechnicalVehiculo[];
  canEdit: boolean;
  createMarcaAction: ActionFn;
  updateMarcaAction: ActionFn;
  deleteMarcaAction: ActionFn;
  createModeloAction: ActionFn;
  updateModeloAction: ActionFn;
  deleteModeloAction: ActionFn;
  createMotorAction: ActionFn;
  updateMotorAction: ActionFn;
  deleteMotorAction: ActionFn;
  createVehiculoAction: ActionFn;
  updateVehiculoAction: ActionFn;
  deleteVehiculoAction: ActionFn;
  toggleVehiculoHiddenAction: ActionFn;
};

export function InformacionTecnicaPage({
  activeSection,
  q,
  currentPage,
  pageSize,
  totalItems,
  sectionCounts,
  marcas,
  modelos,
  motores,
  vehiculos,
  canEdit,
  createMarcaAction,
  updateMarcaAction,
  deleteMarcaAction,
  createModeloAction,
  updateModeloAction,
  deleteModeloAction,
  createMotorAction,
  updateMotorAction,
  deleteMotorAction,
  createVehiculoAction,
  updateVehiculoAction,
  deleteVehiculoAction,
  toggleVehiculoHiddenAction,
}: Props) {
  const [hiddenMarcas, setHiddenMarcas] = useState<Set<number>>(
    () => new Set(marcas.filter((m) => m.hidden).map((m) => m.id))
  );
  const [hiddenVehiculos, setHiddenVehiculos] = useState<Set<number>>(
    () => new Set(vehiculos.filter((v) => v.hidden).map((v) => v.id))
  );
  const [marcasTab, setMarcasTab] = useState<"visible" | "ocultas">("visible");
  const [vehiculosTab, setVehiculosTab] = useState<"visible" | "ocultos">("visible");

  const confirmMarcaHiddenChange = (marcaId: number, hidden: boolean) => {
    setHiddenMarcas(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        newSet.add(marcaId);
      } else {
        newSet.delete(marcaId);
      }
      return newSet;
    });

    const modelosDeMarca = modelos.filter(m => m.marcaId === marcaId);
    const vehiculosDeMarca = vehiculos.filter(v => modelosDeMarca.some(m => m.id === v.modeloId));
    setHiddenVehiculos(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        vehiculosDeMarca.forEach((v) => newSet.add(v.id));
      } else {
        vehiculosDeMarca.forEach((v) => newSet.delete(v.id));
      }
      return newSet;
    });
  };

  const confirmVehiculoHiddenChange = (vehiculoId: number, hidden: boolean) => {
    setHiddenVehiculos(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        newSet.add(vehiculoId);
      } else {
        newSet.delete(vehiculoId);
      }
      return newSet;
    });
  };

  const filteredModelos = modelos.filter(m => !hiddenMarcas.has(m.marcaId));
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);

  const cardCommon = {
    section: activeSection,
    count: sectionCounts[activeSection],
    q,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    pageStart,
    pageEnd,
    totalItems,
  };

  let sectionContent: React.ReactNode = null;

  if (activeSection === "marcas") {
    const marcasVisibles = marcas.filter(m => !hiddenMarcas.has(m.id));
    const marcasOcultas = marcas.filter(m => hiddenMarcas.has(m.id));
    const marcasActivas = marcasTab === "visible" ? marcasVisibles : marcasOcultas;
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={
          marcasTab === "ocultas"
            ? "No hay marcas ocultas."
            : q ? "Sin resultados para la búsqueda." : "No hay marcas aún."
        }
        createForm={canEdit && marcasTab === "visible" ? <AddMarcaForm action={createMarcaAction} /> : undefined}
        tabsSlot={
          <ButtonGroup
            options={[
              { value: "visible", label: "Visibles", icon: "eye" },
              { value: "ocultas", label: `Ocultas${marcasOcultas.length > 0 ? ` (${marcasOcultas.length})` : ""}`, icon: "eyeSlash" },
            ]}
            value={marcasTab}
            onChange={setMarcasTab}
            className="scale-[0.82] origin-right p-0.5"
            buttonClassName="gap-1 px-2 py-1 text-[11px]"
          />
        }
      >
        {marcasActivas.map((marca, i) => (
          <MarcaRow
            key={marca.id}
            marca={marca}
            index={i}
            updateAction={updateMarcaAction}
            deleteAction={deleteMarcaAction}
            canEdit={canEdit}
            hiddenMarcas={hiddenMarcas}
            confirmMarcaHiddenChange={confirmMarcaHiddenChange}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "modelos") {
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={q ? "Sin resultados para la búsqueda." : "No hay modelos aún."}
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Nombre", className: "flex-1" },
                { label: "Marca", className: "w-[180px]" },
              ]}
            />
          ) : undefined
        }
        createForm={
          canEdit ? (
            <AddModeloForm marcas={marcas} action={createModeloAction} />
          ) : undefined
        }
      >
        {filteredModelos.map((modelo, i) => (
          <ModeloRow
            key={modelo.id}
            modelo={modelo}
            index={i}
            marcas={marcas}
            updateAction={updateModeloAction}
            deleteAction={deleteModeloAction}
            canEdit={canEdit}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "motores") {
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={q ? "Sin resultados para la búsqueda." : "No hay motores aún."}
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Nombre", className: "flex-1" },
                { label: "Cilindrada", className: "w-[140px]" },
              ]}
            />
          ) : undefined
        }
        createForm={canEdit ? <AddMotorForm action={createMotorAction} /> : undefined}
      >
        {motores.map((motor, i) => (
          <MotorRow
            key={motor.id}
            motor={motor}
            index={i}
            updateAction={updateMotorAction}
            deleteAction={deleteMotorAction}
            canEdit={canEdit}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "vehiculos") {
    const vehiculosVisibles = vehiculos.filter(v => !hiddenVehiculos.has(v.id));
    const vehiculosOcultos = vehiculos.filter(v => hiddenVehiculos.has(v.id));
    const vehiculosActivos = vehiculosTab === "visible" ? vehiculosVisibles : vehiculosOcultos;
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={
          vehiculosTab === "ocultos"
            ? "No hay vehículos ocultos."
            : q ? "Sin resultados para la búsqueda." : "No hay relaciones aún."
        }
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Modelo", className: "flex-1" },
                { label: "Motor", className: "flex-1" },
              ]}
            />
          ) : undefined
        }
        createForm={
          canEdit && vehiculosTab === "visible" ? (
            <AddVehiculoForm
              modelos={modelos}
              motores={motores}
              action={createVehiculoAction}
            />
          ) : undefined
        }
        tabsSlot={
          <ButtonGroup
            options={[
              { value: "visible", label: "Visibles", icon: "eye" },
              { value: "ocultos", label: `Ocultos${vehiculosOcultos.length > 0 ? ` (${vehiculosOcultos.length})` : ""}`, icon: "eyeSlash" },
            ]}
            value={vehiculosTab}
            onChange={setVehiculosTab}
            className="scale-[0.82] origin-right p-0.5"
            buttonClassName="gap-1 px-2 py-1 text-[11px]"
          />
        }
      >
        {vehiculosActivos.map((vehiculo, i) => (
          <VehiculoRow
            key={vehiculo.id}
            vehiculo={vehiculo}
            index={i}
            modelos={modelos}
            motores={motores}
            updateAction={updateVehiculoAction}
            deleteAction={deleteVehiculoAction}
            canEdit={canEdit}
            hiddenVehiculos={hiddenVehiculos}
            confirmVehiculoHiddenChange={confirmVehiculoHiddenChange}
            toggleHiddenAction={toggleVehiculoHiddenAction}
          />
        ))}
      </ContentCard>
    );
  }

  return (
    <div
      className={cn(
        "InformacionTecnicaPage",
        styles.InformacionTecnicaPage,
        "space-y-6"
      )}
    >
      <PageHeader
        eyebrow="Catálogo técnico"
        title="Información técnica"
        description={`${totalItems.toLocaleString("es-AR")} ${SECTION_LABELS[activeSection].toLowerCase()} en el catálogo.`}
      />

      {!canEdit && (
        <section className="rounded-[24px] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-5 py-4 text-sm text-[var(--color-warning-text)]">
          Tenés acceso de solo lectura. Para editar esta información necesitás un
          usuario con permisos de administración.
        </section>
      )}

      <Card as="nav">
        <SectionTabs
          activeSection={activeSection}
          q={q}
          sectionCounts={sectionCounts}
        />
      </Card>

      {sectionContent}
    </div>
  );
}
