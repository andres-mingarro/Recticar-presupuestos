"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import styles from "./MainMenu.module.scss";

const baseItems = [
  { href: "/", label: "Dashboard", icon: "gauge" as const, exact: true },
  { href: "/clientes", label: "Clientes", icon: "user" as const, exact: false },
  { href: "/pedidos", label: "Pedidos", icon: "clipboard" as const, exact: false },
  { href: "/precios", label: "Precios", icon: "tag" as const, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  role?: string;
  onClose?: () => void;
};

export function MainMenu({ role, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    ...baseItems,
    ...(role === "admin" || role === "superuser"
      ? [{ href: "/admin/usuarios", label: "Usuarios", icon: "shieldUser" as const, exact: false }]
      : []),
  ];

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
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          <Icon name="power" className="h-4 w-4" />
          Salir
        </button>
      </div>
    </div>
  );
}
