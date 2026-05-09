"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { TechnicalMarca } from "@/lib/types";
import { cn } from "@/lib/cn";
import { getBrandLogoUrl } from "@/lib/vehicle-logo";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import styles from "./MarcaDialogSelect.module.scss";

type Props = {
  name?: string;
  marcas: TechnicalMarca[];
  value?: number | string | null;
  selectedName?: string | null;
  disabled?: boolean;
  className?: string;
  onChange?: (marca: TechnicalMarca) => void;
  variant?: ButtonVariant;
};

function BrandLogo({ nombre }: { nombre: string }) {
  const url = getBrandLogoUrl(nombre);

  if (url) {
    return (
      <div className={styles.logoWrapper}>
        <Image src={url} alt={nombre} width={64} height={48} className={styles.logoImg} unoptimized />
      </div>
    );
  }

  return (
    <div className={styles.logoFallback}>
      <span>{nombre[0]?.toUpperCase() ?? "?"}</span>
    </div>
  );
}

function TriggerLogo({ nombre }: { nombre: string }) {
  const url = getBrandLogoUrl(nombre);

  if (url) {
    return <Image src={url} alt="" width={42} height={32} className={styles.triggerLogo} unoptimized />;
  }

  return <span className={styles.triggerFallback}>{nombre[0]?.toUpperCase() ?? "?"}</span>;
}

export function MarcaDialogSelect({
  name,
  marcas,
  value,
  selectedName,
  disabled = false,
  className,
  onChange,
  variant = "soft-dark",
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(value ? String(value) : "");

  useEffect(() => {
    setSelectedId(value ? String(value) : "");
  }, [value]);

  const selectedMarca = useMemo(
    () => marcas.find((marca) => String(marca.id) === selectedId) ?? null,
    [marcas, selectedId]
  );
  const label = selectedMarca?.nombre ?? selectedName ?? "Elegir marca";

  function handleSelect(marca: TechnicalMarca) {
    setSelectedId(String(marca.id));
    onChange?.(marca);
    setOpen(false);
  }

  return (
    <div className={cn("marca-dialog-select", styles.MarcaDialogSelect, className)}>
      {name ? <input type="hidden" name={name} value={selectedId} /> : null}
      <Button
        type="button"
        variant={variant}
        size="md"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn("w-full", styles.trigger)}
        icon={
          selectedId ? (
            <TriggerLogo nombre={label} />
          ) : (
            <Icon name="car" className="size-3 shrink-0" />
          )
        }
        iconRight={<Icon name="chevronDown" className="size-3 shrink-0" />}
      >
        <span className={styles.triggerLabel}>
          <span className={styles.triggerText}>{label}</span>
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="centered" className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Marca</DialogTitle>
          </DialogHeader>
          <div className={styles.brandList}>
            <div className={styles.brandGrid}>
              {marcas.map((marca) => (
                <button
                  key={marca.id}
                  type="button"
                  onClick={() => handleSelect(marca)}
                  className={cn(
                    styles.brandCard,
                    String(marca.id) === selectedId && styles.brandCardSelected
                  )}
                >
                  <BrandLogo nombre={marca.nombre} />
                  <span className={styles.brandName}>{marca.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
