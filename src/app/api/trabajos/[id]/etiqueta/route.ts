import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { getTrabajoDetailById } from "@/lib/queries/trabajos";
import { EtiquetaPdf } from "@/lib/pdf/EtiquetaPdf";
import { generateQrDataUrl } from "@/lib/qr";

function slugify(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const trabajoId = Number(id);
  if (Number.isNaN(trabajoId)) return new Response("ID inválido", { status: 400 });

  const trabajo = await getTrabajoDetailById(trabajoId);
  if (!trabajo) return new Response("Trabajo no encontrado", { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const qrDataUrl = await generateQrDataUrl(`${baseUrl}/trabajos/${trabajoId}`);

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(EtiquetaPdf, { trabajo, qrDataUrl })
  );

  const fileName = [
    "QR-T",
    trabajo.numero_trabajo,
    slugify(trabajo.cliente_nombre),
    slugify(trabajo.motor_nombre),
  ].filter(Boolean).join("-") + ".pdf";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
