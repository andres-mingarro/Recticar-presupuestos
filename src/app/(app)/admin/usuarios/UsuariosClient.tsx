"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ButtonAdd } from "@/components/ui/ButtonAdd/ButtonAdd";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input/Input";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import type { UsuarioPublico, AppPermiso } from "@/lib/queries/usuarios";
import {
  crearUsuarioAction,
  actualizarPermisosAction,
  actualizarPantallaInicioAction,
  cambiarPasswordAction,
  toggleActivoAction,
  eliminarUsuarioAction,
} from "./actions";
import type { PantallaInicio } from "@/lib/queries/usuarios";

type Props = {
  usuarios: UsuarioPublico[];
  currentNombre: string;
  protectedNombre: string;
};

const PERMISOS_LABELS: { permiso: AppPermiso; label: string }[] = [
  { permiso: "trabajos.ver", label: "Ver trabajos" },
  { permiso: "trabajos.crear", label: "Crear presupuestos / trabajos" },
  { permiso: "trabajos.editar", label: "Editar presupuestos / trabajos" },
  { permiso: "clientes.acceso", label: "Ver listado de clientes" },
];

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-3 flex items-center text-[var(--text-color-gray)] hover:text-[var(--text-color-defult)]"
      aria-label={visible ? "Ocultar" : "Mostrar"}
    >
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

function PermisosToggles({
  nombre,
  permisos,
  onDirtyChange,
  onSaveRef,
}: {
  nombre: string;
  permisos: AppPermiso[];
  onDirtyChange: (dirty: boolean) => void;
  onSaveRef: (fn: () => Promise<void>) => void;
}) {
  const [current, setCurrent] = useState<AppPermiso[]>(permisos);

  function toggle(permiso: AppPermiso) {
    const next = current.includes(permiso)
      ? current.filter((p) => p !== permiso)
      : [...current, permiso];
    setCurrent(next);
    onDirtyChange(true);
    onSaveRef(async () => {
      await actualizarPermisosAction(nombre, next);
      onDirtyChange(false);
    });
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {PERMISOS_LABELS.map(({ permiso, label }) => {
        const enabled = current.includes(permiso);
        return (
          <label key={permiso} className="flex items-center justify-between gap-3 cursor-pointer select-none py-2.5">
            <span className="text-sm text-[var(--text-color-defult)]">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => toggle(permiso)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-neutral-border)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        );
      })}
    </div>
  );
}

function UsuarioCard({
  u,
  isSuperAdmin,
  isCurrentUser,
  isProtectedAdmin,
}: {
  u: UsuarioPublico;
  isSuperAdmin: boolean;
  isCurrentUser: boolean;
  isProtectedAdmin: boolean;
}) {
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [permisosDirty, setPermisosDirty] = useState(false);
  const [permisosSaveFn, setPermisosSaveFn] = useState<(() => Promise<void>) | null>(null);
  const [pantallaValue, setPantallaValue] = useState<PantallaInicio>(u.pantalla_inicio);
  const [pantallaDirty, setPantallaDirty] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);

  const dirty = permisosDirty || pantallaDirty;

  async function handleGuardar() {
    setPending(true);
    try {
      if (permisosDirty && permisosSaveFn) await permisosSaveFn();
      if (pantallaDirty) {
        await actualizarPantallaInicioAction(u.nombre, pantallaValue);
        setPantallaDirty(false);
      }
    } finally {
      setPending(false);
    }
  }

  async function handleCambiarPassword() {
    if (!newPassword.trim()) return;
    setPending(true);
    try {
      await cambiarPasswordAction(u.nombre, newPassword);
      setEditingPassword(false);
      setNewPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-sm space-y-4">
      {/* Header de la card */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isSuperAdmin ? "bg-[var(--step-soft-from)] text-[var(--step-soft-ink)]" : "bg-[var(--color-surface-alt)] text-[var(--text-color-gray)]"}`}>
            {u.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-color-defult)]">{u.nombre}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${isSuperAdmin ? "text-[var(--color-accent)]" : "text-[var(--text-color-ligth)]"}`}>
              {isSuperAdmin ? "Administrador" : "Operario"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${u.activo ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]" : "bg-[var(--color-neutral-bg)] text-[var(--text-color-ligth)] border-[var(--color-neutral-border)]"}`}>
            <span className={`size-1.5 rounded-full ${u.activo ? "bg-emerald-500" : "bg-slate-400"}`} />
            {u.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Contraseña</p>
        <div className="flex items-center gap-2">
          {editingPassword ? (
            <>
              <PulsatingButton
                type="button"
                size="sm"
                pulsing={!pending}
                disabled={pending}
                onClick={handleCambiarPassword}
                className="gap-1.5 shrink-0"
              >
                {pending ? <Spinner className="size-3.5" /> : null}
                {pending ? "..." : "Guardar"}
              </PulsatingButton>
              <Button size="sm" variant="ghost" onClick={() => { setEditingPassword(false); setNewPassword(""); setShowPassword(false); }}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="md"
              variant="outline-ghost"
              onClick={() => { setEditingPassword(true); setNewPassword(""); }}
              icon={<Icon name="key" className="size-4" />}
            >
              Cambiar
            </Button>
          )}
          <div className="relative flex-1">
            <Input
              type={showPassword ? "text" : "password"}
              value={editingPassword ? newPassword : (u.password_plain ?? "")}
              onChange={(e) => editingPassword && setNewPassword(e.target.value)}
              readOnly={!editingPassword}
              placeholder={editingPassword ? "Nueva contraseña" : ""}
              className="pr-10"
            />
            <EyeToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
        </div>
      </div>

      {/* Acceso */}
      <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="bg-[var(--color-surface-raised)] px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Acceso</p>
        </div>
        <div className="divide-y divide-[var(--color-border)] px-4">
          {isSuperAdmin ? (
            <div className="py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--step-soft-border)] bg-[var(--step-soft-from)] px-2.5 py-1 text-xs font-semibold text-[var(--step-soft-ink)]">
                Acceso total
              </span>
            </div>
          ) : (
            <PermisosToggles
              nombre={u.nombre}
              permisos={u.permisos}
              onDirtyChange={setPermisosDirty}
              onSaveRef={(fn) => setPermisosSaveFn(() => fn)}
            />
          )}
        </div>
      </div>

      {/* Pantalla al entrar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Pantalla al entrar</p>
        <select
          value={pantallaValue}
          onChange={(e) => { setPantallaValue(e.target.value as PantallaInicio); setPantallaDirty(true); }}
          className="h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
        >
          <option value="dashboard">Dashboard</option>
          <option value="trabajos">Trabajos</option>
          <option value="clientes">Clientes</option>
        </select>
      </div>

      {/* Footer con acciones */}
      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title={u.activo ? "Desactivar usuario" : "Activar usuario"}
            onClick={() => toggleActivoAction(u.nombre, !u.activo)}
            className={u.activo ? "text-[var(--color-success-text)]" : "text-[var(--text-color-ligth)] hover:text-[var(--text-color-gray)]"}
            icon={<Icon name="power" className="size-4" />}
          >
            {u.activo ? "Desactivar" : "Activar"}
          </Button>
          {!isCurrentUser && !isProtectedAdmin && (
            <>
              <Button
                type="button"
                size="sm"
                variant="danger-ghost"
                onClick={() => setConfirmEliminar(true)}
                icon={<Icon name="trash" className="size-4" />}
              >
                Eliminar
              </Button>
              <ConfirmDialog
                open={confirmEliminar}
                onOpenChange={setConfirmEliminar}
                title={`¿Eliminar a ${u.nombre}?`}
                description="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={() => eliminarUsuarioAction(u.nombre)}
              />
            </>
          )}
        </div>
        {dirty && (
          <PulsatingButton
            type="button"
            size="sm"
            pulsing
            disabled={pending}
            onClick={handleGuardar}
            className="gap-1.5"
          >
            {pending ? <Spinner className="size-3.5" /> : null}
            {pending ? "Guardando..." : "Guardar"}
          </PulsatingButton>
        )}
      </div>
    </div>
  );
}

export function UsuariosClient({ usuarios, currentNombre, protectedNombre }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<"operario" | "super_admin">("operario");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useErrorNotification(error, newRole);

  const superAdmins = usuarios.filter((u) => u.role === "super_admin");
  const operarios = usuarios.filter((u) => u.role === "operario");

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await crearUsuarioAction(new FormData(e.currentTarget));
      setShowForm(false);
      setNewRole("operario");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        actions={
          !showForm
            ? <ButtonAdd onClick={() => setShowForm(true)}>Nuevo operario</ButtonAdd>
            : <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
        }
      />

      {/* Formulario nuevo operario */}
      {showForm && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
          <p className="mb-4 text-sm font-semibold text-[var(--text-color-defult)]">{newRole === "super_admin" ? "Nuevo administrador" : "Nuevo operario"}</p>
          <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "operario" | "super_admin")}
                className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
              >
                <option value="operario">Operario</option>
                <option value="super_admin">Administrador</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={pending} className="gap-2">
                {pending ? <Spinner className="size-4" /> : null}
                {pending ? "Guardando..." : newRole === "super_admin" ? "Crear administrador" : "Crear operario"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Administradores */}
      {superAdmins.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-color-gray)]">
            Administradores
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {superAdmins.map((u) => (
              <UsuarioCard key={u.nombre} u={u} isSuperAdmin isCurrentUser={u.nombre === currentNombre} isProtectedAdmin={u.nombre === protectedNombre} />
            ))}
          </div>
        </section>
      )}

      {/* Operarios */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-color-gray)]">
          Operarios
        </p>
        {operarios.length === 0 ? (
          <p className="text-sm text-[var(--text-color-gray)]">No hay operarios registrados.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {operarios.map((u) => (
              <UsuarioCard key={u.nombre} u={u} isSuperAdmin={false} isCurrentUser={u.nombre === currentNombre} isProtectedAdmin={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
