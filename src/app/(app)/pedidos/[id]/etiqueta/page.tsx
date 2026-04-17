import { notFound } from "next/navigation";
import { getPedidoDetailById } from "@/lib/queries/pedidos";
import { generateQrSvg } from "@/lib/qr";
import { getVehicleLabel } from "@/lib/format";
import { PrintButton } from "./PrintButton";
import styles from "./EtiquetaPage.module.scss";

export const dynamic = "force-dynamic";

export default async function EtiquetaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedidoId = Number(id);

  if (Number.isNaN(pedidoId)) {
    notFound();
  }

  const pedido = await getPedidoDetailById(pedidoId);

  if (!pedido) {
    notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const pedidoUrl = `${baseUrl}/pedidos/${pedido.id}`;
  const qrSvg = await generateQrSvg(pedidoUrl);

  const vehiculo = getVehicleLabel([
    pedido.marca_nombre,
    pedido.modelo_nombre,
    pedido.motor_nombre,
  ]);

  return (
    <div id="etiqueta-qr-print" className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className={`${styles.etiqueta} flex flex-row items-center gap-5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.08)] w-full max-w-[400px]`}>
        <div
          className={`${styles.qr} h-[120px] w-[120px] shrink-0 [&_svg]:block [&_svg]:h-full [&_svg]:w-full`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: QR SVG generado internamente, no contiene input del usuario
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            #{pedido.numero_pedido}
          </p>
          <p className="truncate text-base font-semibold text-[var(--color-foreground)]">
            {pedido.cliente_nombre ?? "Sin cliente"}
          </p>
          {vehiculo ? (
            <p className="truncate text-[0.8125rem] text-[var(--color-foreground-muted)]">{vehiculo}</p>
          ) : null}
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
