import { queryRows } from "@/lib/db";

export type UserRole = "super_admin" | "operario";

export type AppPermiso =
  | "trabajos.ver"
  | "trabajos.crear"
  | "trabajos.editar"
  | "clientes.acceso";

export type PantallaInicio = "dashboard" | "trabajos" | "clientes";

export type Usuario = Record<string, unknown> & {
  email: string;
  nombre: string;
  password_hash: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
  pantalla_inicio: PantallaInicio;
};

export type UsuarioPublico = Record<string, unknown> & {
  email: string;
  nombre: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
  pantalla_inicio: PantallaInicio;
  permisos: AppPermiso[];
};

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  const rows = await queryRows<Usuario>(
    "SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE",
    [email]
  );
  return rows[0] ?? null;
}

export async function getAllUsuarios(): Promise<UsuarioPublico[]> {
  type UsuarioRow = {
    email: string;
    nombre: string;
    password_plain: string | null;
    role: UserRole;
    activo: boolean;
    created_at: string;
    pantalla_inicio: PantallaInicio;
  };
  const usuarios = await queryRows<UsuarioRow>(
    "SELECT email, nombre, role, activo, password_plain, created_at, pantalla_inicio FROM usuarios ORDER BY created_at DESC"
  );
  if (usuarios.length === 0) return [];

  const emails = usuarios.map((u) => u.email);
  const permisoRows = await queryRows<{ email: string; permiso: AppPermiso }>(
    `SELECT email, permiso FROM usuario_permisos WHERE email = ANY($1)`,
    [emails]
  );

  const permisosByEmail = new Map<string, AppPermiso[]>();
  for (const row of permisoRows) {
    const list = permisosByEmail.get(row.email) ?? [];
    list.push(row.permiso);
    permisosByEmail.set(row.email, list);
  }

  return usuarios.map((u) => ({
    ...u,
    permisos: permisosByEmail.get(u.email) ?? [],
  }));
}

export async function createUsuario(
  email: string,
  nombre: string,
  passwordHash: string,
  passwordPlain: string,
  role: "operario"
): Promise<void> {
  await queryRows(
    "INSERT INTO usuarios (email, nombre, password_hash, password_plain, role) VALUES ($1, $2, $3, $4, $5)",
    [email, nombre, passwordHash, passwordPlain, role]
  );
  // Preset por defecto para operarios
  await queryRows(
    `INSERT INTO usuario_permisos (email, permiso) VALUES ($1, 'trabajos.ver'), ($1, 'trabajos.crear') ON CONFLICT DO NOTHING`,
    [email]
  );
}

export async function updateUsuarioRole(email: string, role: "operario"): Promise<void> {
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

export async function updatePantallaInicio(
  email: string,
  pantalla: PantallaInicio
): Promise<void> {
  await queryRows("UPDATE usuarios SET pantalla_inicio = $1 WHERE email = $2", [pantalla, email]);
}

export async function setUsuarioPermisos(
  email: string,
  permisos: AppPermiso[]
): Promise<void> {
  await queryRows("DELETE FROM usuario_permisos WHERE email = $1", [email]);
  if (permisos.length === 0) return;
  for (const permiso of permisos) {
    await queryRows(
      "INSERT INTO usuario_permisos (email, permiso) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [email, permiso]
    );
  }
}

export async function getUsuarioPermisos(email: string): Promise<AppPermiso[]> {
  const rows = await queryRows<{ permiso: AppPermiso }>(
    "SELECT permiso FROM usuario_permisos WHERE email = $1",
    [email]
  );
  return rows.map((r) => r.permiso);
}
