"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ButtonAdd } from "@/components/ui/ButtonAdd/ButtonAdd";
import { Input } from "@/components/ui/Input/Input";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import type { UserRole, UsuarioPublico } from "@/lib/queries/usuarios";
import {
  crearUsuarioAction,
  cambiarRolAction,
  cambiarPasswordAction,
  toggleActivoAction,
  eliminarUsuarioAction,
} from "./actions";

type Props = {
  usuarios: UsuarioPublico[];
  sessionRole: "admin" | "superuser";
};

const ROL_STYLES: Record<UserRole, string> = {
  admin: "bg-sky-100 text-sky-700 border-sky-200",
  superuser: "bg-orange-100 text-orange-700 border-orange-200",
  operador: "bg-slate-100 text-slate-700 border-slate-200",
};

const ROL_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  superuser: "Superusuario",
  operador: "Operador",
};

const AVATAR_COLORS: Record<UserRole, string> = {
  admin: "bg-sky-100 text-sky-600",
  superuser: "bg-orange-100 text-orange-600",
  operador: "bg-slate-100 text-slate-500",
};

function RolBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${ROL_STYLES[role]}`}>
      {ROL_LABELS[role]}
    </span>
  );
}

function ActivoBadge({ activo }: { activo: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-emerald-500" : "bg-slate-400"}`} />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-3 flex items-center text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
      aria-label={visible ? "Ocultar" : "Mostrar"}
    >
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

export function UsuariosClient({ usuarios, sessionRole }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editPasswordFor, setEditPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [visiblePasswordFor, setVisiblePasswordFor] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await crearUsuarioAction(new FormData(e.currentTarget));
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setPending(false);
    }
  }

  async function handleCambiarPassword(email: string, targetRole: UserRole) {
    if (!newPassword.trim()) return;
    setPending(true);
    try {
      await cambiarPasswordAction(email, newPassword, targetRole);
      setEditPasswordFor(null);
      setNewPassword("");
    } finally {
      setPending(false);
    }
  }

  function canEdit(targetRole: UserRole) {
    if (targetRole === "admin") return false;
    if (sessionRole === "admin") return true;
    if (sessionRole === "superuser" && targetRole === "operador") return true;
    return false;
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_20px_70px_rgba(148,163,184,0.18)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,247,237,0.88))] px-6 py-5">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Administración
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Usuarios
          </h1>
        </div>
        {!showForm
          ? <ButtonAdd onClick={() => setShowForm(true)}>Nuevo usuario</ButtonAdd>
          : <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
        }
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-5">
          <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nombre (usuario para entrar)</label>
              <Input name="nombre" required placeholder="Juan García" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Contraseña inicial</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <EyeToggle visible={showNewPassword} onToggle={() => setShowNewPassword((v) => !v)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Rol</label>
              <select
                name="role"
                required
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
              >
                {sessionRole === "admin" && (
                  <option value="superuser">Superusuario</option>
                )}
                <option value="operador">Operador</option>
              </select>
            </div>
            {error && (
              <p className="col-span-3 text-sm text-red-600">{error}</p>
            )}
            <div className="col-span-3 flex justify-end">
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="h-4 w-4" /> : null}
                {pending ? "Guardando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">
              <th className="px-6 py-4">Usuario</th>
              <th className="px-4 py-4">Contraseña</th>
              <th className="px-4 py-4">Rol</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {usuarios.map((u) => (
              <tr key={u.email} className="group align-middle transition-colors hover:bg-[var(--color-surface-raised)]">
                {/* Usuario */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_COLORS[u.role]}`}>
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[var(--color-foreground)]">{u.nombre}</span>
                  </div>
                </td>

                {/* Contraseña */}
                <td className="px-4 py-4">
                  {u.password_plain ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm text-[var(--color-foreground)]">
                        {visiblePasswordFor === u.email ? u.password_plain : "••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVisiblePasswordFor(visiblePasswordFor === u.email ? null : u.email)}
                        className="text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
                        aria-label={visiblePasswordFor === u.email ? "Ocultar" : "Mostrar"}
                      >
                        {visiblePasswordFor === u.email ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--color-foreground-muted)]">—</span>
                  )}
                </td>

                {/* Rol */}
                <td className="px-4 py-4">
                  {canEdit(u.role) ? (
                    <select
                      defaultValue={u.role}
                      onChange={(e) =>
                        cambiarRolAction(
                          u.email,
                          e.target.value as "superuser" | "operador",
                          u.role
                        )
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                    >
                      {sessionRole === "admin" && (
                        <option value="superuser">Superusuario</option>
                      )}
                      <option value="operador">Operador</option>
                    </select>
                  ) : (
                    <RolBadge role={u.role} />
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-4">
                  <ActivoBadge activo={u.activo} />
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  {canEdit(u.role) && (
                    <div className="flex items-center justify-end gap-1">
                      {editPasswordFor === u.email ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input
                              type={showEditPassword ? "text" : "password"}
                              placeholder="Nueva contraseña"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-44 pr-10"
                            />
                            <EyeToggle visible={showEditPassword} onToggle={() => setShowEditPassword((v) => !v)} />
                          </div>
                          <PulsatingButton
                            type="button"
                            pulsing={!pending}
                            disabled={pending}
                            className="h-9 px-3 text-sm gap-1.5"
                            onClick={() => handleCambiarPassword(u.email, u.role)}
                          >
                            {pending ? <Spinner className="h-3.5 w-3.5" /> : null}
                            {pending ? "Guardando..." : "Guardar"}
                          </PulsatingButton>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditPasswordFor(null); setNewPassword(""); }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          title="Cambiar contraseña"
                          onClick={() => setEditPasswordFor(u.email)}
                          icon={<Icon name="key" className="h-4 w-4" />}
                        />
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        title={u.activo ? "Desactivar usuario" : "Activar usuario"}
                        disabled={pending}
                        onClick={() => toggleActivoAction(u.email, !u.activo, u.role)}
                        className={u.activo ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"}
                        icon={<Icon name="power" className="h-4 w-4" />}
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        title="Eliminar usuario"
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${u.nombre}?`))
                            eliminarUsuarioAction(u.email, u.role);
                        }}
                        icon={<Icon name="trash" className="h-4 w-4" />}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-foreground-muted)]">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
  );
}
