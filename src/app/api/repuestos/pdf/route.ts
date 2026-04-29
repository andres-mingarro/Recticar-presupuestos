import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { listRepuestosAgrupados } from "@/lib/queries/repuestos";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { ListaRepuestosPdf } from "@/lib/pdf/ListaRepuestosPdf";
import { getLogoDataUrl } from "@/lib/pdf/assets";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [grupos, empresa] = await Promise.all([
    listRepuestosAgrupados(),
    getEmpresaConfig(),
  ]);

  const logoDataUrl = await getLogoDataUrl();

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(ListaRepuestosPdf, { grupos, empresa, logoDataUrl })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="catalogo-repuestos.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
