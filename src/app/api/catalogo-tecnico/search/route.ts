import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permisos";
import { queryRowsFromTechnical } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "";
  const mode = searchParams.get("mode") ?? "default";
  const marcaIdParam = Number(searchParams.get("marcaId"));
  const marcaId = Number.isInteger(marcaIdParam) && marcaIdParam > 0 ? marcaIdParam : null;

  // hidden=true → solo ocultos (solo super_admin); hidden=false o ausente → solo visibles
  const rawHidden = searchParams.get("hidden");
  const wantHidden = rawHidden === "true" && isSuperAdmin(session);

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `${q}%`;

  if (type === "marcas") {
    const rows = await queryRowsFromTechnical<{ id: number; nombre: string }>(
      `SELECT id, nombre FROM marcas WHERE nombre ILIKE $1 AND hidden = ${wantHidden} ORDER BY nombre ASC`,
      [pattern]
    );
    return NextResponse.json({
      results: rows.map((r) => ({ value: r.id, label: r.nombre })),
    });
  }

  if (type === "modelos") {
    const params: (string | number)[] = [pattern];
    const marcaFilter = marcaId ? ` AND mo.marca_id = $${params.push(marcaId)}` : "";
    const rows = await queryRowsFromTechnical<{
      id: number;
      nombre: string;
      marca_nombre: string | null;
    }>(
      `SELECT mo.id, mo.nombre, ma.nombre AS marca_nombre
       FROM modelos mo
       LEFT JOIN marcas ma ON ma.id = mo.marca_id
       WHERE ${
         mode === "nameOnly"
           ? "mo.nombre ILIKE $1"
           : "(mo.nombre ILIKE $1 OR ma.nombre ILIKE $1)"
       } AND mo.hidden = ${wantHidden}
       ${marcaFilter}
       ORDER BY ma.nombre ASC NULLS LAST, mo.nombre ASC`,
      params
    );
    return NextResponse.json({
      results: rows.map((r) => ({
        value: r.id,
        label: r.nombre,
        searchValue: r.nombre,
      })),
    });
  }

  if (type === "vehiculos") {
    const rows = await queryRowsFromTechnical<{
      id: number;
      nombre: string;
      marca_nombre: string | null;
    }>(
      `SELECT DISTINCT mo.id, mo.nombre, ma.nombre AS marca_nombre
       FROM vehiculos v
       INNER JOIN modelos mo ON mo.id = v.modelo_id
       LEFT JOIN marcas ma ON ma.id = mo.marca_id
       WHERE (mo.nombre ILIKE $1 OR ma.nombre ILIKE $1) AND v.hidden = ${wantHidden}
       ORDER BY ma.nombre ASC NULLS LAST, mo.nombre ASC`,
      [pattern]
    );
    return NextResponse.json({
      results: rows.map((r) => ({ value: r.id, label: r.nombre, searchValue: r.nombre })),
    });
  }

  if (type === "motores") {
    const rows = await queryRowsFromTechnical<{
      id: number;
      nombre: string;
      cilindrada: string | null;
    }>(
      `SELECT id, nombre, cilindrada FROM motores WHERE nombre ILIKE $1 ORDER BY nombre ASC`,
      [pattern]
    );
    return NextResponse.json({
      results: rows.map((r) => ({
        value: r.id,
        label: r.nombre + (r.cilindrada ? ` (${r.cilindrada})` : ""),
      })),
    });
  }

  return NextResponse.json({ results: [] });
}
