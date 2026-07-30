import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { requireSession } from "@/lib/auth";
import { getUsuarioPermisos } from "@/lib/queries/usuarios";
import type { AppPermiso } from "@/lib/queries/usuarios";
import { MODE_COOKIE, THEME_COOKIE, resolveThemeId, resolveThemeMode } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const permisos: AppPermiso[] =
    session.role === "super_admin" ? [] : await getUsuarioPermisos(session.nombre);

  const jar = await cookies();
  const theme = resolveThemeId(jar.get(THEME_COOKIE)?.value);
  const mode = resolveThemeMode(jar.get(MODE_COOKIE)?.value);

  return (
    <AppShell role={session.role} permisos={permisos} theme={theme} mode={mode}>
      {children}
    </AppShell>
  );
}
