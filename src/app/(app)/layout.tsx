import { AppShell } from "@/components/layout/AppShell";
import { requireSession } from "@/lib/auth";
import { getUsuarioPermisos } from "@/lib/queries/usuarios";
import type { AppPermiso } from "@/lib/queries/usuarios";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const permisos: AppPermiso[] =
    session.role === "super_admin" ? [] : await getUsuarioPermisos(session.nombre);

  return (
    <AppShell role={session.role} permisos={permisos}>
      {children}
    </AppShell>
  );
}
