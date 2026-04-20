import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "recticar_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas — siempre accesibles
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/maintenance")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)"],
};
