import { cn } from "@/lib/cn";
import type { PedidoEstado, PedidoPrioridad } from "@/lib/types";
import styles from "./Badge.module.scss";

type ContactBadgeVariant =
  | "phone"
  | "mail"
  | "address"
  | "city"
  | "province"
  | "postalCode";

export function PriorityBadge({ prioridad }: { prioridad: PedidoPrioridad }) {
  const priorityStyles = {
    baja:
      "border-[var(--color-priority-low-border)] bg-[var(--color-priority-low-bg)] text-[var(--color-priority-low-text)]",
    normal:
      "border-[var(--color-priority-normal-border)] bg-[var(--color-priority-normal-bg)] text-[var(--color-priority-normal-text)]",
    alta:
      "border-[var(--color-priority-high-border)] bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high-text)]",
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
    pendiente:
      "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
    aprobado:
      "border-[var(--color-success-border)] bg-[var(--color-success-fill)] text-[var(--color-success-text-strong)]",
    finalizado:
      "border-[var(--color-neutral-border)] bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)]",
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

export function PaymentBadge({ cobrado }: { cobrado: boolean }) {
  return (
    <span
      className={cn(
        "PaymentBadge",
        "Badge",
        styles.Badge,
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        cobrado
          ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text-strong)]"
          : "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
      )}
    >
      {cobrado ? "Cobrado" : "No cobrado"}
    </span>
  );
}

export function ContactBadge({
  variant,
  value,
  mapQuery,
}: {
  variant: ContactBadgeVariant;
  value: string;
  mapQuery?: string;
}) {
  const labels = {
    phone: "Tel",
    mail: "Mail",
    address: "Dir",
    city: "Ciudad",
    province: "Prov",
    postalCode: "CP",
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
    city: (
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
    province: (
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
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
    postalCode: (
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
        <path d="M7 9h10" />
        <path d="M7 13h6" />
      </svg>
    ),
  };

  const badgeClass = cn(
    "ContactBadge",
    "Badge",
    styles.Badge,
    styles.ContactBadge,
    "inline-flex items-center gap-2 rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3.5 py-2 text-sm font-medium text-[var(--color-success-text-strong)]"
  );

  const inner = (
    <>
      <span className={cn("ContactBadgeIcon", styles.ContactBadgeIcon)}>
        {icons[variant]}
      </span>
      <span className={cn("ContactBadgeLabel", styles.ContactBadgeLabel)}>
        {labels[variant]}:
      </span>
      <span className={cn("ContactBadgeValue", styles.ContactBadgeValue)}>
        {value}
      </span>
    </>
  );

  const isMissing = value.startsWith("Sin ");

  if (variant === "phone" && !isMissing) {
    const rawPhone = value.replace(/\D/g, "");
    const waNumber = rawPhone.startsWith("54") ? rawPhone : `54${rawPhone}`;
    const waIcon = (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    );

    return (
      <span className={cn("ContactBadgeGroup", styles.ContactBadgeGroup, "flex gap-1 w-full")}>
        <a href={`tel:${rawPhone}`} className={cn(badgeClass, "shrink-0")}>
          {inner}
        </a>
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(badgeClass, "flex-1 justify-center gap-1.5")}
          aria-label="Enviar WhatsApp"
        >
          {waIcon}
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
      </span>
    );
  }

  if (variant === "mail" && !isMissing) {
    return (
      <a href={`mailto:${value}`} className={badgeClass}>
        {inner}
      </a>
    );
  }

  if (variant === "address" && !isMissing && mapQuery) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    return (
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={badgeClass}>
        {inner}
      </a>
    );
  }

  return (
    <span className={badgeClass}>
      {inner}
    </span>
  );
}

export function BusinessDaysBadge({
  days,
  prefix,
}: {
  days: number;
  prefix?: string;
}) {
  return (
    <span
      className={cn(
        "BusinessDaysBadge",
        "Badge",
        styles.Badge,
        styles.BusinessDaysBadge,
        "inline-flex items-center rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-foreground-muted)]"
      )}
    >
      {prefix ? `${prefix} ` : null}
      {days} {days === 1 ? "dia habil" : "dias habiles"}
    </span>
  );
}
