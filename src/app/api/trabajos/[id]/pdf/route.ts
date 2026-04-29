import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { getTrabajoDetailById } from "@/lib/queries/trabajos";
import { getTrabajosDetalleByTrabajo } from "@/lib/queries/catalogo";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { getRepuestosDetalleByTrabajo } from "@/lib/queries/repuestos";
import { PresupuestoPdf } from "@/lib/pdf/PresupuestoPdf";
import { getLogoDataUrl } from "@/lib/pdf/assets";
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const trabajoId = Number(id);
  const mostrarPreciosTrabajos = new URL(request.url).searchParams.get("precios") === "1";

  if (Number.isNaN(trabajoId)) {
    return new Response("ID inválido", { status: 400 });
  }

  const trabajo = await getTrabajoDetailById(trabajoId);

  if (!trabajo) {
    return new Response("Trabajo no encontrado", { status: 404 });
  }

  const [trabajos, repuestos, empresa] = await Promise.all([
    getTrabajosDetalleByTrabajo(trabajoId, (trabajo.lista_precio as 1 | 2 | 3) ?? 1),
    getRepuestosDetalleByTrabajo(trabajoId),
    getEmpresaConfig(),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const [qrDataUrl, logoDataUrl] = await Promise.all([
    generateQrDataUrl(`${baseUrl}/trabajos/${trabajoId}`),
    getLogoDataUrl(),
  ]);

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(PresupuestoPdf, { trabajo, trabajos, repuestos, qrDataUrl, empresa, mostrarPreciosTrabajos, logoDataUrl })
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
