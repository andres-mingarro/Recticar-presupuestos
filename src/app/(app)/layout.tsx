import Link from "next/link";
import Image from "next/image";
import { MainMenu } from "@/components/navigation/MainMenu";
import { getSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[28px] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="Recticar Presupuestos"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>
          <MainMenu role={session?.role} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
