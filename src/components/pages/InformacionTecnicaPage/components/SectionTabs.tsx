import { cn } from "@/lib/cn";
import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { buildSectionHref } from "./buildSectionHref";

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

const SECTION_ICONS = {
  marcas: "tag",
  modelos: "clipboard",
  motores: "gauge",
  vehiculos: "car",
} as const;

export function SectionTabs({
  activeSection,
  q,
  sectionCounts,
}: {
  activeSection: TechnicalSection;
  q: string;
  sectionCounts: Record<TechnicalSection, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(SECTION_LABELS) as TechnicalSection[]).map((section) => {
        const active = section === activeSection;
        return (
          <Link
            key={section}
            href={buildSectionHref(section, q)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
              active
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--text-color-gray)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            )}
          >
            <Icon name={SECTION_ICONS[section]} className="h-4 w-4 shrink-0" />
            <span>{SECTION_LABELS[section]}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                active
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-surface-alt)] text-[var(--text-color-defult)]"
              )}
            >
              {sectionCounts[section]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
