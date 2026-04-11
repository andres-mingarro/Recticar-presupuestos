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

  const pedido = await getPedidoDetailById(pedidoId);
  const trabajos = await getTrabajosDetalleByPedido(pedidoId, (pedido?.lista_precio as 1 | 2 | 3) ?? 1);

  if (!pedido) {
    return new Response("Pedido no encontrado", { status: 404 });
  }

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(PresupuestoPdf, { pedido, trabajos })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${pedido.numero_pedido}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
