import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import { resolveSearchParams } from "@/lib/search-params";
import { InformacionTecnicaPage } from "@/components/pages/InformacionTecnicaPage";
import {
  countTechnicalMarcas,
  countTechnicalModelos,
  countTechnicalMotores,
  countTechnicalVehiculos,
  getTechnicalSectionCounts,
  listTechnicalMarcas,
  listTechnicalModelos,
  listTechnicalMotores,
  listTechnicalVehiculos,
  type TechnicalSection,
} from "@/lib/queries/informacion-tecnica";
import {
  createMarcaAction,
  createModeloAction,
  createMotorAction,
  createVehiculoAction,
  deleteMarcaAction,
  deleteModeloAction,
  deleteMotorAction,
  deleteVehiculoAction,
  updateMarcaAction,
  updateModeloAction,
  updateMotorAction,
  updateVehiculoAction,
  toggleVehiculoHiddenAction,
} from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const VALID_SECTIONS: TechnicalSection[] = ["marcas", "modelos", "motores", "vehiculos"];

function isTechnicalSection(value: string): value is TechnicalSection {
  return VALID_SECTIONS.includes(value as TechnicalSection);
}

const VALID_TABS_MARCAS = ["visible", "ocultas"] as const;
const VALID_TABS_MODELOS = ["visible", "ocultos"] as const;
const VALID_TABS_VEHICULOS = ["visible", "ocultos"] as const;
type MarcasTab = (typeof VALID_TABS_MARCAS)[number];
type ModelosTab = (typeof VALID_TABS_MODELOS)[number];
type VehiculosTab = (typeof VALID_TABS_VEHICULOS)[number];

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string; q?: string; page?: string; tab?: string }>;
}) {
  const { session } = await getSessionWithPermisos();
  const canEdit = isSuperAdmin(session);

  const params = await resolveSearchParams(searchParams);
  const section =
    typeof params.section === "string" && isTechnicalSection(params.section)
      ? params.section
      : "marcas";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const rawTab = typeof params.tab === "string" ? params.tab : "";
  const marcasTab: MarcasTab =
    section === "marcas" && (VALID_TABS_MARCAS as readonly string[]).includes(rawTab)
      ? (rawTab as MarcasTab)
      : "visible";
  const modelosTab: ModelosTab =
    section === "modelos" && (VALID_TABS_MODELOS as readonly string[]).includes(rawTab)
      ? (rawTab as ModelosTab)
      : "visible";
  const vehiculosTab: VehiculosTab =
    section === "vehiculos" && (VALID_TABS_VEHICULOS as readonly string[]).includes(rawTab)
      ? (rawTab as VehiculosTab)
      : "visible";

  const marcasHiddenFilter = section === "marcas" ? marcasTab === "ocultas" : undefined;
  const modelosHiddenFilter = section === "modelos" ? modelosTab === "ocultos" : undefined;
  const vehiculosHiddenFilter = section === "vehiculos" ? vehiculosTab === "ocultos" : undefined;

  const [sectionCounts, [marcas, modelos, motores, vehiculos, totalItems]] = await Promise.all([
    getTechnicalSectionCounts(),
    Promise.all([
      section === "marcas" || section === "modelos"
        ? listTechnicalMarcas(
            section === "marcas"
              ? { search: q, limit: PAGE_SIZE, offset, hidden: marcasHiddenFilter }
              : { limit: 5000, hidden: false }
          )
        : Promise.resolve([]),
      section === "modelos" || section === "vehiculos"
        ? listTechnicalModelos(
            section === "modelos"
              ? { search: q, limit: PAGE_SIZE, offset, hidden: modelosHiddenFilter }
              : { limit: 5000 }
          )
        : Promise.resolve([]),
      section === "motores" || section === "vehiculos"
        ? listTechnicalMotores(section === "motores" ? { search: q, limit: PAGE_SIZE, offset } : { limit: 5000 })
        : Promise.resolve([]),
      section === "vehiculos"
        ? listTechnicalVehiculos({ search: q, limit: PAGE_SIZE, offset, hidden: vehiculosHiddenFilter })
        : Promise.resolve([]),
      section === "marcas"
        ? countTechnicalMarcas(q, marcasHiddenFilter)
        : section === "modelos"
          ? countTechnicalModelos(q, modelosHiddenFilter)
          : section === "motores"
            ? countTechnicalMotores(q)
            : countTechnicalVehiculos(q, vehiculosHiddenFilter),
    ]),
  ]);

  return (
    <InformacionTecnicaPage
      activeSection={section}
      q={q}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      totalItems={totalItems}
      sectionCounts={sectionCounts}
      marcas={marcas}
      modelos={modelos}
      motores={motores}
      vehiculos={vehiculos}
      marcasTab={marcasTab}
      modelosTab={modelosTab}
      vehiculosTab={vehiculosTab}
      canEdit={canEdit}
      createMarcaAction={createMarcaAction}
      updateMarcaAction={updateMarcaAction}
      deleteMarcaAction={deleteMarcaAction}
      createModeloAction={createModeloAction}
      updateModeloAction={updateModeloAction}
      deleteModeloAction={deleteModeloAction}
      createMotorAction={createMotorAction}
      updateMotorAction={updateMotorAction}
      deleteMotorAction={deleteMotorAction}
      createVehiculoAction={createVehiculoAction}
      updateVehiculoAction={updateVehiculoAction}
      deleteVehiculoAction={deleteVehiculoAction}
      toggleVehiculoHiddenAction={toggleVehiculoHiddenAction}
    />
  );
}
