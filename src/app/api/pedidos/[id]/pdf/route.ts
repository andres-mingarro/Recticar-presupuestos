import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getPedidoDetailById } from "@/lib/queries/pedidos";
import { getTrabajosDetalleByPedido } from "@/lib/queries/catalogo";
import { PresupuestoPdf } from "@/lib/pdf/PresupuestoPdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pedidoId = Number(id);

  if (Number.isNaN(pedidoId)) {
    return new Response("ID inválido", { status: 400 });
  }

  const [pedido, trabajos] = await Promise.all([
    getPedidoDetailById(pedidoId),
    getTrabajosDetalleByPedido(pedidoId),
  ]);

  if (!pedido) {
    return new Response("Pedido no encontrado", { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(PresupuestoPdf, { pedido, trabajos }) as any
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${pedido.numero_pedido}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
