import { getSession } from "@/lib/auth";
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
} from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const VALID_SECTIONS: TechnicalSection[] = ["marcas", "modelos", "motores", "vehiculos"];

function isTechnicalSection(value: string): value is TechnicalSection {
  return VALID_SECTIONS.includes(value as TechnicalSection);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string; q?: string; page?: string }>;
}) {
  const session = await getSession();
  const canEdit = session?.role === "admin" || session?.role === "superuser";

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

  const [sectionCounts, [marcas, modelos, motores, vehiculos, totalItems]] = await Promise.all([
    getTechnicalSectionCounts(),
    Promise.all([
      section === "marcas" || section === "modelos"
        ? listTechnicalMarcas(section === "marcas" ? { search: q, limit: PAGE_SIZE, offset } : {})
        : Promise.resolve([]),
      section === "modelos" || section === "vehiculos"
        ? listTechnicalModelos(section === "modelos" ? { search: q, limit: PAGE_SIZE, offset } : { limit: 5000 })
        : Promise.resolve([]),
      section === "motores" || section === "vehiculos"
        ? listTechnicalMotores(section === "motores" ? { search: q, limit: PAGE_SIZE, offset } : { limit: 5000 })
        : Promise.resolve([]),
      section === "vehiculos"
        ? listTechnicalVehiculos({ search: q, limit: PAGE_SIZE, offset })
        : Promise.resolve([]),
      section === "marcas"
        ? countTechnicalMarcas(q)
        : section === "modelos"
          ? countTechnicalModelos(q)
          : section === "motores"
            ? countTechnicalMotores(q)
            : countTechnicalVehiculos(q),
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
    />
  );
}
