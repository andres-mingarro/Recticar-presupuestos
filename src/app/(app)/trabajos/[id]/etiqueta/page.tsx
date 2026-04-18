import { notFound } from "next/navigation";
import { getTrabajoDetailById } from "@/lib/queries/trabajos";
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
  const trabajoId = Number(id);

  if (Number.isNaN(trabajoId)) {
    notFound();
  }

  const trabajo = await getTrabajoDetailById(trabajoId);

  if (!trabajo) {
    notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const trabajoUrl = `${baseUrl}/trabajos/${trabajo.id}`;
  const qrSvg = await generateQrSvg(trabajoUrl);

  const vehiculo = getVehicleLabel([
    trabajo.marca_nombre,
    trabajo.modelo_nombre,
    trabajo.motor_nombre,
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
            #{trabajo.numero_trabajo}
          </p>
          <p className="truncate text-base font-semibold text-[var(--text-color-defult)]">
            {trabajo.cliente_nombre ?? "Sin cliente"}
          </p>
          {vehiculo ? (
            <p className="truncate text-[0.8125rem] text-[var(--text-color-gray)]">{vehiculo}</p>
          ) : null}
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
