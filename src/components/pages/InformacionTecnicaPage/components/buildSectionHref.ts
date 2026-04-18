import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";

export function buildSectionHref(section: TechnicalSection, q: string, page = 1) {
  const params = new URLSearchParams();
  params.set("section", section);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/informacion-tecnica?${params.toString()}`;
}
