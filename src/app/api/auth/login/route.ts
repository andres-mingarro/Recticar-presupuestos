import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createToken, COOKIE_NAME, EXPIRES_IN } from "@/lib/auth";
import { getUsuarioByEmail } from "@/lib/queries/usuarios";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json() as { username: string; password: string };

  if (!username || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Admin hardcodeado en .env
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await createToken({ email: username, nombre: "Admin", role: "admin" });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: EXPIRES_IN,
      path: "/",
    });
    return res;
  }

  // Usuarios en la DB
  const usuario = await getUsuarioByEmail(username);
  if (!usuario) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, usuario.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = await createToken({
    email: usuario.email,
    nombre: usuario.nombre,
    role: usuario.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRES_IN,
    path: "/",
  });
  return res;
}
