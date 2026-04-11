import { NextResponse } from "next/server";
import { findClientesByName } from "@/lib/queries/clientes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ clientes: [] });
  }

  const clientes = await findClientesByName(q);

  return NextResponse.json({ clientes });
}
