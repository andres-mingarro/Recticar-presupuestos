import { cn } from "@/lib/cn";
import type { PedidoEstado, PedidoPrioridad } from "@/lib/types";
import styles from "./Badge.module.scss";

type ContactBadgeVariant = "phone" | "mail" | "address";

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

export function ContactBadge({
  variant,
  value,
}: {
  variant: ContactBadgeVariant;
  value: string;
}) {
  const labels = {
    phone: "Tel",
    mail: "Mail",
    address: "Dir",
  };

  const icons = {
    phone: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z" />
      </svg>
    ),
    mail: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
    address: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    ),
  };

  return (
    <span
      className={cn(
        "ContactBadge",
        "Badge",
        styles.Badge,
        styles.ContactBadge,
        "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800"
      )}
    >
      <span className={cn("ContactBadgeIcon", styles.ContactBadgeIcon)}>
        {icons[variant]}
      </span>
      <span className={cn("ContactBadgeLabel", styles.ContactBadgeLabel)}>
        {labels[variant]}:
      </span>
      <span className={cn("ContactBadgeValue", styles.ContactBadgeValue)}>
        {value}
      </span>
    </span>
  );
}
