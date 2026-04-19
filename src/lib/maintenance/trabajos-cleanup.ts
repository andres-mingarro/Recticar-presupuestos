import { queryRows } from "@/lib/db";
import { getEmpresaConfig, updateEmpresaCleanupLastRun } from "@/lib/queries/empresa";

export type CleanupPresupuestosResult = {
  enabled: boolean;
  retentionMonths: number;
  deletedCount: number;
  ranAt: string;
};

export async function cleanupExpiredPresupuestosEntregados() {
  const empresa = await getEmpresaConfig();
  const ranAt = new Date().toISOString();

  if (!empresa.autoEliminarPresupuestosEntregados) {
    return {
      enabled: false,
      retentionMonths: empresa.mesesRetencionPresupuestoEntregado,
      deletedCount: 0,
      ranAt,
    } satisfies CleanupPresupuestosResult;
  }

  const retentionMonths = Math.max(1, empresa.mesesRetencionPresupuestoEntregado);

  const rows = await queryRows<{ deleted_count: number }>(
    `
      WITH target AS (
        SELECT id
        FROM ordenes_trabajo
        WHERE estado = 'presupuesto_entregado'::orden_trabajo_estado
          AND cobrado = false
          AND fecha_presupuesto_entregado IS NOT NULL
          AND fecha_presupuesto_entregado < now() - make_interval(months => $1::int)
      ),
      del_trabajos AS (
        DELETE FROM orden_trabajo_trabajos
        WHERE orden_trabajo_id IN (SELECT id FROM target)
      ),
      del_repuestos AS (
        DELETE FROM orden_trabajo_repuestos
        WHERE orden_trabajo_id IN (SELECT id FROM target)
      ),
      del_ordenes AS (
        DELETE FROM ordenes_trabajo
        WHERE id IN (SELECT id FROM target)
        RETURNING id
      )
      SELECT COUNT(*)::int AS deleted_count
      FROM del_ordenes
    `,
    [retentionMonths]
  );

  await updateEmpresaCleanupLastRun(ranAt);

  return {
    enabled: true,
    retentionMonths,
    deletedCount: rows[0]?.deleted_count ?? 0,
    ranAt,
  } satisfies CleanupPresupuestosResult;
}
