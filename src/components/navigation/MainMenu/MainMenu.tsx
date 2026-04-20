"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import styles from "./MainMenu.module.scss";

type MenuItem = {
  href: string;
  label: string;
  icon: "gauge" | "user" | "clipboard" | "tag" | "package";
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
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  role?: string;
  permisos?: string[];
  onClose?: () => void;
};

export function MainMenu({ role, permisos = [], onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isSuperAdmin = role === "super_admin";

  const items = allItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.requiredPermiso) return isSuperAdmin || permisos.includes(item.requiredPermiso);
    return true;
  });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onClose?.();
    router.replace("/login");
  }

  return (
    <div className={styles.MainMenu}>
      <nav className={styles.nav} aria-label="Principal">
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
              <Icon name={item.icon} className="h-[1.1rem] w-[1.1rem] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {isSuperAdmin && (
          <Link
            href="/configuracion"
            onClick={onClose}
            className={cn(
              styles.tecnicaLink,
              isActive(pathname, "/configuracion", false) && styles.tecnicaLinkActive
            )}
          >
            <Icon name="settings" className="h-4 w-4 shrink-0" />
            Configuración
          </Link>
        )}
        <div className={styles.divider} />
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          <Icon name="power" className="h-4 w-4" />
          Salir
        </button>
      </div>
    </div>
  );
}
