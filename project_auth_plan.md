---
name: Plan de autenticación y roles
description: Plan completo para implementar auth con NextAuth, Google login y sistema de roles
type: project
originSessionId: 42d9cf24-083b-4a64-ba85-405a3966e213
---
## Roles definidos

| Rol | Acceso |
|-----|--------|
| `admin` | Todo. Usuario/contraseña fijo, NO usa Google, roles intocables, nadie puede modificarlo ni borrarlo |
| `superuser` | Igual que admin EXCEPTO que no puede tocar al `admin`. Un superuser puede modificar/borrar a otro superuser |
| `operador` | Solo ve listado de trabajos, puede entrar a un cliente y ver sus trabajos. Solo lectura |

## Reglas clave
- Admin: credenciales fijas hardcodeadas (o en .env), nunca en tabla usuarios, sin posibilidad de cambiar rol ni borrar
- Superuser: gestión completa de usuarios EXCEPTO el admin y sus propios privilegios
- Operador: acceso de solo lectura, sin crear ni editar nada

## Stack decidido
- **NextAuth.js** para manejo de sesiones
- **Google OAuth** para superuser y operador
- **Credentials provider** para admin (usuario/pass en .env)
- Tabla `usuarios` en Neon con email + role para superuser/operador
- Pantalla `/admin/usuarios` para gestionar usuarios (solo admin y superuser)

## Plan de implementación

### 1. Base de datos
- Migración: tabla `usuarios` (email PRIMARY KEY, role TEXT, nombre TEXT, activo BOOLEAN)
- Seed: no hace falta, el admin no va en la tabla

### 2. NextAuth setup
- Instalar `next-auth`
- Configurar Google OAuth provider (Google Cloud Console: crear proyecto, OAuth credentials)
- Configurar Credentials provider para admin
- Handler en `src/app/api/auth/[...nextauth]/route.ts`
- Callback `signIn`: verificar que el email esté en tabla `usuarios` (para Google), bloquear si no está
- Callback `session`: adjuntar `role` a la sesión

### 3. Middleware de protección
- `middleware.ts` en raíz: redirigir a `/login` si no hay sesión
- Helpers de autorización: `requireRole(role)` para usar en Server Components y Actions

### 4. Pantalla de login
- `/login` — botón "Entrar con Google" + formulario usuario/contraseña para admin
- Redirect a `/` si ya está logueado

### 5. Pantalla de gestión de usuarios `/admin/usuarios`
- Solo visible para `admin` y `superuser`
- Lista todos los usuarios con rol
- Agregar usuario: email + rol (superuser/operador)
- Cambiar rol
- Desactivar/borrar usuario
- Restricción: superuser no puede tocar al admin ni a otros superusers (solo admin puede)

### 6. Protección por rol en la app
- Ocultar botones de crear/editar/borrar para `operador`
- Server Actions verifican rol antes de ejecutar (no solo UI)
- Operador: acceso a `/trabajos` (listado) y `/clientes/[id]` (solo lectura)

## Variables de entorno necesarias
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_USER=
ADMIN_PASSWORD=
```

**Why:** El taller necesita que 2-3 personas usen la app con distintos niveles de acceso. La app va a estar en dominio público detrás de Cloudflare, así que necesita auth real.

**How to apply:** Antes de arrancar, verificar que el cliente tenga Google Cloud Console configurado para el dominio final, o usar un proyecto de prueba para dev.
