import { queryRows } from "@/lib/db";

export type UserRole = "admin" | "superuser" | "operador";

export type Usuario = Record<string, unknown> & {
  email: string;
  nombre: string;
  password_hash: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
};

export type UsuarioPublico = Record<string, unknown> & {
  email: string;
  nombre: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
};

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  const rows = await queryRows<Usuario>(
    "SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE",
    [email]
  );
  return rows[0] ?? null;
}

export async function getAllUsuarios(): Promise<UsuarioPublico[]> {
  return queryRows<UsuarioPublico>(
    "SELECT email, nombre, role, activo, password_plain, created_at FROM usuarios ORDER BY created_at DESC"
  );
}

export async function createUsuario(
  email: string,
  nombre: string,
  passwordHash: string,
  passwordPlain: string,
  role: "superuser" | "operador"
): Promise<void> {
  await queryRows(
    "INSERT INTO usuarios (email, nombre, password_hash, password_plain, role) VALUES ($1, $2, $3, $4, $5)",
    [email, nombre, passwordHash, passwordPlain, role]
  );
}

export async function updateUsuarioRole(email: string, role: "superuser" | "operador"): Promise<void> {
  await queryRows("UPDATE usuarios SET role = $1 WHERE email = $2", [role, email]);
}

export async function updateUsuarioPassword(
  email: string,
  passwordHash: string,
  passwordPlain: string
): Promise<void> {
  await queryRows(
    "UPDATE usuarios SET password_hash = $1, password_plain = $2 WHERE email = $3",
    [passwordHash, passwordPlain, email]
  );
}

export async function toggleUsuarioActivo(email: string, activo: boolean): Promise<void> {
  await queryRows("UPDATE usuarios SET activo = $1 WHERE email = $2", [activo, email]);
}

export async function deleteUsuario(email: string): Promise<void> {
  await queryRows("DELETE FROM usuarios WHERE email = $1", [email]);
}
