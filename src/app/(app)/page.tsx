import { getSessionWithPermisos } from "@/lib/permisos";
import {
  getDashboardStats,
  listTrabajosAprobados,
  listPresupuestosVencidos,
  listMotoresMasUsados,
  listRepuestosMasUsados,
} from "@/lib/queries/trabajos";
import { listMotores } from "@/lib/queries/catalogo";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { HomePage } from "@/components/pages/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { session, permisos } = await getSessionWithPermisos();

  const [stats, trabajosAprobados, presupuestosVencidos, motoresMasUsados, repuestosMasUsados, todosLosMotores, empresa] =
    await Promise.all([
      getDashboardStats(),
      listTrabajosAprobados(8),
      listPresupuestosVencidos(3, 5),
      listMotoresMasUsados(5),
      listRepuestosMasUsados(5),
      listMotores(),
      getEmpresaConfig(),
    ]);

  const motoresMap = new Map(todosLosMotores.map((m) => [m.id, m.nombre]));
  const motoresConNombre = motoresMasUsados.map((m) => ({
    nombre: motoresMap.get(m.motor_id) ?? `Motor #${m.motor_id}`,
    cantidad: m.cantidad,
  }));

  return (
    <HomePage
      session={session}
      permisos={permisos}
      stats={stats}
      trabajosAprobados={trabajosAprobados}
      diasHabilesUmbralVerde={empresa.diasHabilesUmbralVerde}
      diasHabilesUmbralNaranja={empresa.diasHabilesUmbralNaranja}
      presupuestosVencidos={presupuestosVencidos}
      motoresMasUsados={motoresConNombre}
      repuestosMasUsados={repuestosMasUsados}
    />
  );
}
