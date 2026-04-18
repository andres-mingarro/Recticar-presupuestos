"use client";

import { cn } from "@/lib/cn";
import { SearchBox, searchConfigs, type SearchEntity } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/Button";
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
        <Button type="submit" className="flex-1 sm:flex-none" icon={<Icon name="search" className="h-4 w-4" />}>
          Buscar
        </Button>

        <Button
          as="a"
          href={config.clearHref}
          variant="secondary"
          className="flex-1 sm:flex-none"
          icon={<Icon name="x" className="h-4 w-4" />}
        >
          Limpiar
        </Button>
      </div>
    </form>
  );
}
