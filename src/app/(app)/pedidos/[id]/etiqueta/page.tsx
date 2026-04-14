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
    <div className={styles.wrapper}>
      <div className={styles.etiqueta}>
        <div
          className={styles.qr}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: QR SVG generado internamente, no contiene input del usuario
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className={styles.info}>
          <p className={styles.numero}>#{pedido.numero_pedido}</p>
          <p className={styles.cliente}>
            {pedido.cliente_nombre ?? "Sin cliente"}
          </p>
          {vehiculo ? (
            <p className={styles.vehiculo}>{vehiculo}</p>
          ) : null}
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
