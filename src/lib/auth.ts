import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import type { UserRole } from "@/lib/queries/usuarios";

const COOKIE_NAME = "recticar_token";
const EXPIRES_IN = 60 * 60 * 8; // 8 horas

export interface SessionPayload {
  email: string;
  nombre: string;
  role: UserRole;
  sessionId: string;
}

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET no está definido en .env.local");
  return new TextEncoder().encode(s);
}

export async function createToken(
  payload: Omit<SessionPayload, "sessionId">
): Promise<string> {
  return new SignJWT({ ...payload, sessionId: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.email !== "string" ||
      typeof payload.nombre !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      email: payload.email,
      nombre: payload.nombre,
      role: payload.role as UserRole,
      sessionId:
        typeof payload.sessionId === "string" ? payload.sessionId : `legacy-${token.slice(-12)}`,
    };
  } catch {
    return null;
  }
}

// Para usar en Server Components y Server Actions
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME, EXPIRES_IN };
