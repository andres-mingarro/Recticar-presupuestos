import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { listTrabajosAgrupados } from "@/lib/queries/catalogo";
import { getEmpresaConfig } from "@/lib/queries/empresa";
import { ListaPreciosPdf } from "@/lib/pdf/ListaPreciosPdf";
import { getLogoDataUrl } from "@/lib/pdf/assets";
import { LISTAS_PRECIOS, type ListaPrecio } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const listaParam = url.searchParams.get("lista");
  const listas: ListaPrecio[] = listaParam
    ? [Number(listaParam) as ListaPrecio].filter((n) => (LISTAS_PRECIOS as readonly number[]).includes(n))
    : [...LISTAS_PRECIOS];

  if (listas.length === 0) {
    return new Response("Lista inválida", { status: 400 });
  }

  const [grupos, empresa] = await Promise.all([
    listTrabajosAgrupados(),
    getEmpresaConfig(),
  ]);

  const logoDataUrl = await getLogoDataUrl();

  const buffer = await renderToBuffer(
    // @ts-expect-error: @react-pdf/renderer types incompatibles con React 19
    React.createElement(ListaPreciosPdf, { grupos, empresa, listas, logoDataUrl })
  );

  const fileName = listas.length === 1
    ? `lista-precios-${listas[0]}.pdf`
    : "lista-precios.pdf";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
