"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./EstadisticasButton.module.scss";

export function EstadisticasButton({
  action,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  function handleOpen() {
    setOpen(true);
    setError(false);
    setShowPassword(false);
    requestAnimationFrame(() => setVisible(true));
  }

  function handleClose() {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(false);
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        handleClose();
        push("/estadisticas");
      } else {
        setError(true);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="dark"
        onClick={handleOpen}
        className=""
      >
        <Icon name="chartBar"/>
        <span className="">Estadísticas</span>
        <Icon name="chevronRight" className="" />
      </Button>

      {open && (
        <div
          className={cn(styles.overlay, visible && styles.overlayVisible)}
          onClick={handleClose}
        >
          <aside
            className={cn(styles.panel, visible && styles.panelVisible)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Acceso restringido
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                  <Icon name="chartBar" className="size-5 text-[var(--color-accent)]" />
                  Estadísticas
                </h3>
                <p className="mt-1 text-xs text-[var(--text-color-gray)]">
                  Ingresá la contraseña para ver los datos.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                icon={<Icon name="x" className="size-4" />}
              >
                Cerrar
              </Button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    autoFocus
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2.5 pl-3 pr-10 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--orange-vivid)]/20"
                  />
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-color-gray)] hover:text-[var(--text-color-defult)]"
                  >
                    <Icon name={showPassword ? "eyeSlash" : "eye"} className="size-4" />
                  </span>
                </div>

                {error && (
                  <p className="text-xs text-red-500">Contraseña incorrecta.</p>
                )}

                <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
                  {isPending ? <Spinner className="size-4" /> : "Ingresar"}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
