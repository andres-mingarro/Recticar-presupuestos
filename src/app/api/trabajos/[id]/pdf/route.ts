import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getTrabajoDetailById } from "@/lib/queries/trabajos";
import { getTrabajosDetalleByTrabajo } from "@/lib/queries/catalogo";
import { getRepuestosDetalleByTrabajo } from "@/lib/queries/repuestos";
import { PresupuestoPdf } from "@/lib/pdf/PresupuestoPdf";
import { generateQrDataUrl } from "@/lib/qr";

function slugifyFilenamePart(value: string | null | undefined) {
  return (value ?? "sin-cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "sin-cliente";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trabajoId = Number(id);

  if (Number.isNaN(trabajoId)) {
    return new Response("ID inválido", { status: 400 });
  }

  const trabajo = await getTrabajoDetailById(trabajoId);

  if (!trabajo) {
    return new Response("Trabajo no encontrado", { status: 404 });
  }

  const [trabajos, repuestos] = await Promise.all([
    getTrabajosDetalleByTrabajo(trabajoId, (trabajo.lista_precio as 1 | 2 | 3) ?? 1),
    getRepuestosDetalleByTrabajo(trabajoId),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const qrDataUrl = await generateQrDataUrl(`${baseUrl}/trabajos/${trabajoId}`);

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(PresupuestoPdf, { trabajo, trabajos, repuestos, qrDataUrl })
  );
  const clienteSlug = slugifyFilenamePart(trabajo.cliente_nombre);
  const fileName = `presupuesto-${trabajo.numero_trabajo}-${clienteSlug}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
