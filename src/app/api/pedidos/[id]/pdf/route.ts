import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getPedidoDetailById } from "@/lib/queries/pedidos";
import { getTrabajosDetalleByPedido } from "@/lib/queries/catalogo";
import { getRepuestosDetalleByPedido } from "@/lib/queries/repuestos";
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
  const pedidoId = Number(id);

  if (Number.isNaN(pedidoId)) {
    return new Response("ID inválido", { status: 400 });
  }

  const pedido = await getPedidoDetailById(pedidoId);

  if (!pedido) {
    return new Response("Pedido no encontrado", { status: 404 });
  }

  const [trabajos, repuestos] = await Promise.all([
    getTrabajosDetalleByPedido(pedidoId, (pedido.lista_precio as 1 | 2 | 3) ?? 1),
    getRepuestosDetalleByPedido(pedidoId),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const qrDataUrl = await generateQrDataUrl(`${baseUrl}/pedidos/${pedidoId}`);

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(PresupuestoPdf, { pedido, trabajos, repuestos, qrDataUrl })
  );
  const clienteSlug = slugifyFilenamePart(pedido.cliente_nombre);
  const fileName = `presupuesto-${pedido.numero_pedido}-${clienteSlug}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
