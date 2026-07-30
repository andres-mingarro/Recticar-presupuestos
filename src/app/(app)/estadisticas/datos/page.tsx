import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import { MapaDatosPage } from "@/components/pages/MapaDatosPage";

export const dynamic = "force-dynamic";

const ESTADISTICAS_COOKIE = "estadisticas_auth";

export default async function Page() {
  // Mismo doble guard que /estadisticas: super_admin + desbloqueo desde /configuracion.
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/");

  const jar = await cookies();
  if (jar.get(ESTADISTICAS_COOKIE)?.value !== "1") redirect("/configuracion");

  return <MapaDatosPage />;
}
