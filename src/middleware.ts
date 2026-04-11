import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "recticar_token";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no está definido");
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas — siempre accesibles
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role as string | undefined;

    // Operador: solo lectura
    if (role === "operador") {
      const blocked =
        pathname.startsWith("/clientes/nuevo") ||
        pathname.startsWith("/pedidos/nuevo") ||
        pathname.startsWith("/precios") ||
        pathname.startsWith("/admin");
      if (blocked) {
        return NextResponse.redirect(new URL("/pedidos", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Token inválido o expirado
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)"],
};
