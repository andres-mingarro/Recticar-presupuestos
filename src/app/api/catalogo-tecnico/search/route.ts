import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryRowsFromTechnical } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `${q}%`;

  if (type === "marcas") {
    const rows = await queryRowsFromTechnical<{ id: number; nombre: string }>(
      `SELECT id, nombre FROM marcas WHERE nombre ILIKE $1 ORDER BY nombre ASC`,
      [pattern]
    );
    return NextResponse.json({
      results: rows.map((r) => ({ value: r.id, label: r.nombre })),
    });
  }

  if (type === "modelos") {
    const rows = await queryRowsFromTechnical<{
      id: number;
      nombre: string;
      marca_nombre: string | null;
    }>(
      `SELECT mo.id, mo.nombre, ma.nombre AS marca_nombre
       FROM modelos mo
       LEFT JOIN marcas ma ON ma.id = mo.marca_id
       WHERE mo.nombre ILIKE $1 OR ma.nombre ILIKE $1
       ORDER BY ma.nombre ASC NULLS LAST, mo.nombre ASC`,
      [pattern]
    );
    return NextResponse.json({
      results: rows.map((r) => ({
        value: r.id,
        label: (r.marca_nombre ? `${r.marca_nombre} / ` : "") + r.nombre,
      })),
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
