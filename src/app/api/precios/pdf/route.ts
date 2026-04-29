import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { listTrabajosAgrupados } from "@/lib/queries/catalogo";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { ListaPreciosPdf } from "@/lib/pdf/ListaPreciosPdf";
import { getLogoDataUrl } from "@/lib/pdf/assets";
export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [grupos, empresa] = await Promise.all([
    listTrabajosAgrupados(),
    getEmpresaConfig(),
  ]);

  const logoDataUrl = await getLogoDataUrl();

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(ListaPreciosPdf, { grupos, empresa, logoDataUrl })
  );

  const fileName = "lista-precios.pdf";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
