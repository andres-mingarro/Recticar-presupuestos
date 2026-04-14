"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
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
    <form className={cn("SearchForm", className)}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          {config.label}
        </span>
        <SearchBox entity={entity} initialValue={initialValue} />
      </label>

      <div className="flex w-full gap-3 sm:w-auto">
        <button type="submit" className={buttonStyles({ className: "flex-1 sm:flex-none" })}>
          <Icon name="search" className="h-4 w-4" />
          Buscar
        </button>

        <Link
          href={config.clearHref}
          className={buttonStyles({ variant: "secondary", className: "flex-1 sm:flex-none" })}
        >
          <Icon name="x" className="h-4 w-4" />
          Limpiar
        </Link>
      </div>
    </form>
  );
}
