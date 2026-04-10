import { cn } from "@/lib/cn";
import type { PedidoEstado, PedidoPrioridad } from "@/lib/types";
import styles from "./Badge.module.scss";

export function PriorityBadge({ prioridad }: { prioridad: PedidoPrioridad }) {
  const priorityStyles = {
    baja: "bg-slate-100 text-slate-700 border-slate-200",
    normal: "bg-sky-100 text-sky-700 border-sky-200",
    alta: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "PriorityBadge",
        "Badge",
        styles.Badge,
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        priorityStyles[prioridad]
      )}
    >
      {prioridad}
    </span>
  );
}

export function StatusBadge({ estado }: { estado: PedidoEstado }) {
  const statusStyles = {
    pendiente: "bg-amber-100 text-amber-800 border-amber-200",
    aprobado: "bg-emerald-100 text-emerald-800 border-emerald-200",
    finalizado: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "StatusBadge",
        "Badge",
        styles.Badge,
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        statusStyles[estado]
      )}
    >
      {estado}
    </span>
  );
}
