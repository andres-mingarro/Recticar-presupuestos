"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type {
  TechnicalMarca,
  TechnicalModelo,
  TechnicalMotor,
  TechnicalVehiculo,
} from "@/lib/types";
import type { TechnicalSection, TechnicalSectionCounts } from "@/lib/queries/informacion-tecnica";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./InformacionTecnicaPage.module.scss";
import { type ActionFn, ColHeaders } from "./components/shared";
import { buildSectionHref } from "./components/buildSectionHref";
import { SectionTabs } from "./components/SectionTabs";
import { HeaderTable } from "./components/HeaderTable";
import { MarcaRow } from "./components/MarcaRow";
import { ModeloRow } from "./components/ModeloRow";
import { MotorRow } from "./components/MotorRow";
import { VehiculoRow } from "./components/VehiculoRow";
import { AddMarcaForm } from "./components/AddMarcaForm";
import { AddModeloForm } from "./components/AddModeloForm";
import { AddMotorForm } from "./components/AddMotorForm";
import { AddVehiculoForm } from "./components/AddVehiculoForm";
import { ModeloMarcaFilter } from "./components/ModeloMarcaFilter";

// buildSectionHref is re-exported for use in server components / pages if needed
export { buildSectionHref };

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

type MarcasTab = "visible" | "ocultas";
type ModelosTab = "visible" | "ocultos";
type VehiculosTab = "visible" | "ocultos";

type Props = {
  activeSection: TechnicalSection;
  q: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  sectionCounts: TechnicalSectionCounts;
  marcas: TechnicalMarca[];
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  vehiculos: TechnicalVehiculo[];
  marcasTab: MarcasTab;
  modelosTab: ModelosTab;
  vehiculosTab: VehiculosTab;
  modelosMarcaId: string;
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

function TabLinks<T extends string>({
  options,
  activeValue,
}: {
  options: { value: T; label: string; icon: IconName; href: string }[];
  activeValue: T;
}) {
  const activeCls =
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)]";
  const inactiveCls =
    "border-transparent bg-transparent text-[var(--text-color-gray)] hover:bg-white hover:text-[var(--text-color-defult)]";
  return (
    <div className="ButtonGroup inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-0.5 scale-[0.82]">
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={opt.href}
          aria-pressed={opt.value === activeValue}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]",
            opt.value === activeValue ? activeCls : inactiveCls
          )}
        >
          <Icon name={opt.icon} className="size-4 shrink-0" />
          <span className="whitespace-nowrap">{opt.label}</span>
        </Link>
      ))}
    </div>
  );
}

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
  marcasTab,
  modelosTab,
  vehiculosTab,
  modelosMarcaId,
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

  const confirmMarcaHiddenChange = (marcaId: number, hidden: boolean) => {
    setHiddenMarcas(prev => {
      const newSet = new Set(prev);
      if (hidden) newSet.add(marcaId);
      else newSet.delete(marcaId);
      return newSet;
    });
  };

  const confirmVehiculoHiddenChange = (vehiculoId: number, hidden: boolean) => {
    setHiddenVehiculos(prev => {
      const newSet = new Set(prev);
      if (hidden) newSet.add(vehiculoId);
      else newSet.delete(vehiculoId);
      return newSet;
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);

  const activeTab =
    activeSection === "marcas" ? marcasTab :
    activeSection === "modelos" ? modelosTab :
    activeSection === "vehiculos" ? vehiculosTab :
    undefined;

  const cardCommon = {
    section: activeSection,
    count: activeSection === "motores"
      ? sectionCounts.motores
      : activeSection === "marcas"
        ? (activeTab === "ocultas" ? sectionCounts.marcas.hidden : sectionCounts.marcas.visible)
        : activeSection === "modelos"
          ? (activeTab === "ocultos" ? sectionCounts.modelos.hidden : sectionCounts.modelos.visible)
          : (activeTab === "ocultos" ? sectionCounts.vehiculos.hidden : sectionCounts.vehiculos.visible),
    q,
    tab: activeTab !== "visible" ? activeTab : undefined,
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
    const marcasOcultasCount = sectionCounts.marcas.hidden;
    sectionContent = (
      <HeaderTable
        {...cardCommon}
        emptyLabel={
          marcasTab === "ocultas"
            ? "No hay marcas ocultas."
            : q ? "Sin resultados para la búsqueda." : "No hay marcas aún."
        }
        createForm={canEdit && marcasTab === "visible" ? <AddMarcaForm action={createMarcaAction} /> : undefined}
        tabsSlot={
          <TabLinks
            options={[
              { value: "visible", label: "Visibles", icon: "eye", href: buildSectionHref(activeSection, q, 1) },
              { value: "ocultas", label: `Ocultas${marcasOcultasCount > 0 ? ` (${marcasOcultasCount})` : ""}`, icon: "eyeSlash", href: buildSectionHref(activeSection, q, 1, "ocultas") },
            ]}
            activeValue={marcasTab}
          />
        }
      >
        {marcas.map((marca, i) => (
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
      </HeaderTable>
    );
  }

  if (activeSection === "modelos") {
    const modelosOcultosCount = sectionCounts.modelos.hidden;
    sectionContent = (
      <HeaderTable
        {...cardCommon}
        emptyLabel={
          modelosTab === "ocultos"
            ? "No hay modelos ocultos."
            : q ? "Sin resultados para la búsqueda." : "No hay modelos aún."
        }
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
        createForm={canEdit && modelosTab === "visible" ? <AddModeloForm action={createModeloAction} marcas={marcas} /> : undefined}
        toolbarSlot={
          <ModeloMarcaFilter
            marcas={marcas}
            q={q}
            tab={modelosTab !== "visible" ? modelosTab : undefined}
            marcaId={modelosMarcaId}
          />
        }
        marcaId={modelosMarcaId}
        tabsSlot={
          <TabLinks
            options={[
              { value: "visible", label: "Visibles", icon: "eye", href: buildSectionHref(activeSection, q, 1, undefined, modelosMarcaId) },
              { value: "ocultos", label: `Ocultos${modelosOcultosCount > 0 ? ` (${modelosOcultosCount})` : ""}`, icon: "eyeSlash", href: buildSectionHref(activeSection, q, 1, "ocultos", modelosMarcaId) },
            ]}
            activeValue={modelosTab}
          />
        }
      >
        {modelos.map((modelo, i) => (
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
      </HeaderTable>
    );
  }

  if (activeSection === "motores") {
    sectionContent = (
      <HeaderTable
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
      </HeaderTable>
    );
  }

  if (activeSection === "vehiculos") {
    const vehiculosOcultosCount = sectionCounts.vehiculos.hidden;
    sectionContent = (
      <HeaderTable
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
            <AddVehiculoForm action={createVehiculoAction} />
          ) : undefined
        }
        tabsSlot={
          <TabLinks
            options={[
              { value: "visible", label: "Visibles", icon: "eye", href: buildSectionHref(activeSection, q, 1) },
              { value: "ocultos", label: `Ocultos${vehiculosOcultosCount > 0 ? ` (${vehiculosOcultosCount})` : ""}`, icon: "eyeSlash", href: buildSectionHref(activeSection, q, 1, "ocultos") },
            ]}
            activeValue={vehiculosTab}
          />
        }
      >
        {vehiculos.map((vehiculo, i) => (
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
      </HeaderTable>
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
