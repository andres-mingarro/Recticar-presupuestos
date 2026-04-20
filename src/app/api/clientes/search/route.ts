import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findClientesByName } from "@/lib/queries/clientes";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ clientes: [] });
  }

  const clientes = await findClientesByName(q);

  return NextResponse.json({ clientes });
}
