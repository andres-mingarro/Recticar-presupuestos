"use client";

import Link from "next/link";
import { SearchBox, searchConfigs, type SearchEntity } from "@/components/search/SearchBox";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type SearchFormProps = {
  entity: SearchEntity;
  initialValue: string;
  className?: string;
};

export function SearchForm({
  entity,
  initialValue,
  className,
}: SearchFormProps) {
  const config = searchConfigs[entity];

  return (
    <form className={className}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          {config.label}
        </span>
        <SearchBox entity={entity} initialValue={initialValue} />
      </label>

      <button type="submit" className={buttonStyles({ className: "w-full sm:w-auto" })}>
        <Icon name="search" className="h-4 w-4" />
        Buscar
      </button>

      <Link
        href={config.clearHref}
        className={buttonStyles({ variant: "secondary", className: "w-full sm:w-auto" })}
      >
        <Icon name="x" className="h-4 w-4" />
        Limpiar
      </Link>
    </form>
  );
}
