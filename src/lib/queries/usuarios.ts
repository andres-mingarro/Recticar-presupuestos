import { queryRows } from "@/lib/db";

export type UserRole = "admin" | "superuser" | "operador";

export type Usuario = Record<string, unknown> & {
  email: string;
  nombre: string;
  password_hash: string;
  role: UserRole;
  activo: boolean;
  created_at: string;
};

export type UsuarioPublico = Record<string, unknown> & {
  email: string;
  nombre: string;
  role: UserRole;
  activo: boolean;
  created_at: string;
};

export async function getUsuarioByEmail(
  email: string
): Promise<Usuario | null> {
  const rows = await queryRows<Usuario>(
    "SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE",
    [email]
  );
  return rows[0] ?? null;
}

export async function getAllUsuarios(): Promise<UsuarioPublico[]> {
  return queryRows<UsuarioPublico>(
    "SELECT email, nombre, role, activo, created_at FROM usuarios ORDER BY created_at DESC"
  );
}

export async function createUsuario(
  email: string,
  nombre: string,
  passwordHash: string,
  role: "superuser" | "operador"
): Promise<void> {
  await queryRows(
    "INSERT INTO usuarios (email, nombre, password_hash, role) VALUES ($1, $2, $3, $4)",
    [email, nombre, passwordHash, role]
  );
}

export async function updateUsuarioRole(
  email: string,
  role: "superuser" | "operador"
): Promise<void> {
  await queryRows("UPDATE usuarios SET role = $1 WHERE email = $2", [
    role,
    email,
  ]);
}

export async function updateUsuarioPassword(
  email: string,
  passwordHash: string
): Promise<void> {
  await queryRows("UPDATE usuarios SET password_hash = $1 WHERE email = $2", [
    passwordHash,
    email,
  ]);
}

export async function toggleUsuarioActivo(
  email: string,
  activo: boolean
): Promise<void> {
  await queryRows("UPDATE usuarios SET activo = $1 WHERE email = $2", [
    activo,
    email,
  ]);
}

export async function deleteUsuario(email: string): Promise<void> {
  await queryRows("DELETE FROM usuarios WHERE email = $1", [email]);
}
