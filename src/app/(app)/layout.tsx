import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return <AppShell role={session?.role}>{children}</AppShell>;
}
