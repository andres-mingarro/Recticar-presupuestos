"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import styles from "./MainMenu.module.scss";

const baseItems = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/clientes", label: "Clientes", exact: false },
  { href: "/pedidos", label: "Pedidos", exact: false },
  { href: "/precios", label: "Precios", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  role?: string;
};

export function MainMenu({ role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const items = [
    ...baseItems,
    ...(role === "admin" || role === "superuser"
      ? [{ href: "/admin/usuarios", label: "Usuarios", exact: false }]
      : []),
  ];

  function closeMenu() {
    setIsClosing(true);
    window.setTimeout(() => {
      setMenuOpen(false);
      setIsClosing(false);
    }, 200);
  }

  useEffect(() => {
    if (menuOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <div className="flex w-full items-center justify-end gap-3">
        <nav
          className={cn("MainMenu", styles.MainMenu, styles.desktopNav, "text-sm")}
          aria-label="Principal"
        >
          {items.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  styles.link,
                  active && styles.linkActive
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className={styles.desktopLogout}
        >
          Salir
        </button>

        <button
          type="button"
          className={cn(styles.hamburger, styles.mobileToggle, menuOpen && styles.hamburgerOpen)}
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </div>

      {isMounted && (menuOpen || isClosing)
        ? createPortal(
            <div
              className={cn(
                styles.mobileOverlay,
                isClosing && styles.mobileOverlayClosing
              )}
              onClick={closeMenu}
            >
              <div
                className={cn(styles.mobileMenu, isClosing && styles.mobileMenuClosing)}
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.mobileMenuHeader}>
                  <p className={styles.mobileMenuEyebrow}>Navegacion</p>
                  <button
                    type="button"
                    className={styles.mobileClose}
                    onClick={closeMenu}
                    aria-label="Cerrar menu"
                  >
                    <Icon name="x" className="h-5 w-5" />
                  </button>
                </div>

                <nav className={styles.mobileNav} aria-label="Principal mobile">
                  {items.map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(styles.mobileLink, active && styles.mobileLinkActive)}
                        onClick={closeMenu}
                      >
                        <span>{item.label}</span>
                        <Icon name="arrowRight" className="h-4 w-4" />
                      </Link>
                    );
                  })}
                </nav>

                <div className={styles.mobileDivider} />

                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.mobileLogout}
                >
                  <Icon name="power" className="h-4 w-4" />
                  Salir
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
