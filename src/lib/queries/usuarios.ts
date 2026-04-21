import { queryRows } from "@/lib/db";

export type UserRole = "super_admin" | "operario";

export type AppPermiso =
  | "trabajos.ver"
  | "trabajos.crear"
  | "trabajos.editar"
  | "clientes.acceso";

export type PantallaInicio = "dashboard" | "trabajos" | "clientes";

export type Usuario = Record<string, unknown> & {
  nombre: string;
  password_hash: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
  pantalla_inicio: PantallaInicio;
};

export type UsuarioPublico = Record<string, unknown> & {
  nombre: string;
  password_plain: string | null;
  role: UserRole;
  activo: boolean;
  created_at: string;
  pantalla_inicio: PantallaInicio;
  permisos: AppPermiso[];
};

export async function getUsuarioByNombre(nombre: string): Promise<Usuario | null> {
  const rows = await queryRows<Usuario>(
    "SELECT * FROM usuarios WHERE nombre = $1 AND activo = TRUE",
    [nombre]
  );
  return rows[0] ?? null;
}

export async function getAllUsuarios(): Promise<UsuarioPublico[]> {
  type UsuarioRow = {
    nombre: string;
    password_plain: string | null;
    role: UserRole;
    activo: boolean;
    created_at: string;
    pantalla_inicio: PantallaInicio;
  };
  const usuarios = await queryRows<UsuarioRow>(
    "SELECT nombre, role, activo, password_plain, created_at, pantalla_inicio FROM usuarios ORDER BY created_at DESC"
  );
  if (usuarios.length === 0) return [];

  const nombres = usuarios.map((u) => u.nombre);
  const permisoRows = await queryRows<{ nombre: string; permiso: AppPermiso }>(
    `SELECT nombre, permiso FROM usuario_permisos WHERE nombre = ANY($1)`,
    [nombres]
  );

  const permisosByNombre = new Map<string, AppPermiso[]>();
  for (const row of permisoRows) {
    const list = permisosByNombre.get(row.nombre) ?? [];
    list.push(row.permiso);
    permisosByNombre.set(row.nombre, list);
  }

  return usuarios.map((u) => ({
    ...u,
    permisos: permisosByNombre.get(u.nombre) ?? [],
  }));
}

export async function createUsuario(
  nombre: string,
  passwordHash: string,
  passwordPlain: string,
  role: "operario" | "super_admin"
): Promise<void> {
  await queryRows(
    "INSERT INTO usuarios (nombre, password_hash, password_plain, role) VALUES ($1, $2, $3, $4)",
    [nombre, passwordHash, passwordPlain, role]
  );
  if (role === "operario") {
    await queryRows(
      `INSERT INTO usuario_permisos (nombre, permiso) VALUES ($1, 'trabajos.ver'), ($1, 'trabajos.crear') ON CONFLICT DO NOTHING`,
      [nombre]
    );
  }
}

export async function updateUsuarioPassword(
  nombre: string,
  passwordHash: string,
  passwordPlain: string
): Promise<void> {
  await queryRows(
    "UPDATE usuarios SET password_hash = $1, password_plain = $2 WHERE nombre = $3",
    [passwordHash, passwordPlain, nombre]
  );
}

export async function toggleUsuarioActivo(nombre: string, activo: boolean): Promise<void> {
  await queryRows("UPDATE usuarios SET activo = $1 WHERE nombre = $2", [activo, nombre]);
}

export async function deleteUsuario(nombre: string): Promise<void> {
  await queryRows("DELETE FROM usuarios WHERE nombre = $1", [nombre]);
}

export async function updatePantallaInicio(
  nombre: string,
  pantalla: PantallaInicio
): Promise<void> {
  await queryRows("UPDATE usuarios SET pantalla_inicio = $1 WHERE nombre = $2", [pantalla, nombre]);
}

export async function setUsuarioPermisos(
  nombre: string,
  permisos: AppPermiso[]
): Promise<void> {
  await queryRows("DELETE FROM usuario_permisos WHERE nombre = $1", [nombre]);
  if (permisos.length === 0) return;
  for (const permiso of permisos) {
    await queryRows(
      "INSERT INTO usuario_permisos (nombre, permiso) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [nombre, permiso]
    );
  }
}

export async function getUsuarioPermisos(nombre: string): Promise<AppPermiso[]> {
  const rows = await queryRows<{ permiso: AppPermiso }>(
    "SELECT permiso FROM usuario_permisos WHERE nombre = $1",
    [nombre]
  );
  return rows.map((r) => r.permiso);
}
