"use client";

import { useRouter } from "next/navigation";
import type { TechnicalMarca } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { MarcaDialogSelect } from "./MarcaDialogSelect";
import { buildSectionHref } from "./buildSectionHref";

type Props = {
  marcas: TechnicalMarca[];
  q: string;
  tab?: string;
  marcaId?: string;
};

export function ModeloMarcaFilter({ marcas, q, tab, marcaId = "" }: Props) {
  const router = useRouter();
  const selectedMarca = marcas.find((marca) => String(marca.id) === marcaId) ?? null;

  return (
    <div className="ModeloMarcaFilter flex shrink-0 items-center gap-1.5">
      <MarcaDialogSelect
        marcas={marcas}
        value={marcaId}
        variant="primary"
        selectedName={selectedMarca?.nombre}
        className="w-[170px] sm:w-[210px]"
        onChange={(marca) => router.push(buildSectionHref("modelos", q, 1, tab, String(marca.id)))}
      />
      {marcaId ? (
        <Button
          as="a"
          href={buildSectionHref("modelos", q, 1, tab)}
          variant="primary"
          size="md"
          className="shrink-0"
          icon={<Icon name="x" className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Reset</span>
        </Button>
      ) : null}
    </div>
  );
}
