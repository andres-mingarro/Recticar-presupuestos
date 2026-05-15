"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import styles from "./MobileMenu.module.scss";

type MenuItem = {
  href: string;
  label: string;
  icon: IconName;
  exact: boolean;
  requiredPermiso?: string;
  superAdminOnly?: boolean;
};

const allItems: MenuItem[] = [
  { href: "/", label: "Dashboard", icon: "gauge", exact: true },
  { href: "/clientes", label: "Clientes", icon: "user", exact: false, requiredPermiso: "clientes.acceso" },
  { href: "/trabajos", label: "Trabajos", icon: "clipboard", exact: false, requiredPermiso: "trabajos.ver" },
  { href: "/precios", label: "Precios", icon: "tag", exact: false, superAdminOnly: true },
  { href: "/repuestos", label: "Repuestos", icon: "package", exact: false, superAdminOnly: true },
  { href: "/informacion-tecnica", label: "Info. técnica", icon: "car", exact: false, superAdminOnly: true },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  open: boolean;
  onClose: () => void;
  role?: string;
  permisos?: string[];
};

const EMPTY_PERMISOS: string[] = [];

export function MobileMenu({ open, onClose, role, permisos = EMPTY_PERMISOS }: Props) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const isSuperAdmin = role === "super_admin";

  const items = allItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.requiredPermiso) return isSuperAdmin || permisos.includes(item.requiredPermiso);
    return true;
  });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onClose();
    replace("/login");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(styles.backdrop, open && styles.backdropVisible)}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={cn(styles.panel, open && styles.panelOpen)} aria-label="Menú principal">
        <nav className={styles.nav}>
          {items.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(styles.link, active && styles.linkActive)}
                onClick={onClose}
              >
                <span>{item.label}</span>
                <Icon name={item.icon} className={styles.linkIcon} />
              </Link>
            );
          })}

        </nav>

        <div className={styles.footer}>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn} aria-label="Salir">
            <Icon name="power" className="size-4" />
          </button>
          {isSuperAdmin && (
            <Link
              href="/configuracion"
              onClick={onClose}
              className={cn(styles.configBtn, isActive(pathname, "/configuracion", false) && styles.logoutBtnActive)}
            >
              <Icon name="settings" className="size-4" />
              <span>Configuración</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
