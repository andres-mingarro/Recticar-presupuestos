export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function isBusinessDay(value: Date) {
  const day = value.getDay();
  return day !== 0 && day !== 6;
}

export function getBusinessDaysBetween(
  start: string | null | undefined,
  end: string | null | undefined
) {
  if (!start || !end) {
    return 0;
  }

  const startDate = startOfDay(new Date(start));
  const endDate = startOfDay(new Date(end));

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return 0;
  }

  let total = 0;
  const cursor = new Date(startDate);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= endDate) {
    if (isBusinessDay(cursor)) {
      total += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

export function getBusinessDaysSince(value: string | null | undefined) {
  return getBusinessDaysBetween(value, new Date().toISOString());
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function toIntegerPrice(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value);
}

export function getVehicleLabel(parts: Array<string | null | undefined>) {
  const filtered = parts.map((part) => part?.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered.join(" / ") : "Vehículo sin definir";
}
