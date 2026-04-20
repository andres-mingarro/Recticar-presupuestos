# Plan de Permisos de Usuarios

## Objetivo

Reemplazar el esquema actual de acceso basado en checks dispersos por `role` con un modelo simple y extensible:

- `super_admin`: acceso total a todo el sistema.
- `operario`: acceso configurable mediante permisos con switches.

La idea es mantener solo estos dos tipos de usuario, pero permitir que cada operario tenga un conjunto distinto de permisos según necesidad.

## Reglas de negocio acordadas

- `super_admin` siempre puede ver y hacer todo.
- `operario` usa permisos configurables.
- Un operario nuevo debe crearse con un preset por defecto.
- `Precios`, `Repuestos` y `Configuración` no deben estar disponibles para operarios en esta primera versión.
- El `super_admin` debe poder crear operarios con permisos distintos y modificar esos permisos después.

## Permisos iniciales visibles en la UI

Estos son los switches que vamos a mostrar para `operario`:

- `trabajos.ver`
  - Etiqueta UI: `Ver trabajos`
- `trabajos.crear`
  - Etiqueta UI: `Crear presupuestos / trabajos`
- `trabajos.editar`
  - Etiqueta UI: `Editar presupuestos / trabajos`
- `clientes.acceso`
  - Etiqueta UI: `Ver listado de clientes`

## Preset por defecto para un operario nuevo

Al crear un operario nuevo, estos permisos deben quedar así:

- `Ver trabajos`: `ON`
- `Crear presupuestos / trabajos`: `ON`
- `Editar presupuestos / trabajos`: `OFF`
- `Ver listado de clientes (clientes.acceso)`: `OFF`

## Alcance funcional de cada permiso

### `trabajos.ver`

Permite:

- ver el listado de trabajos
- ver el detalle de un trabajo

No implica:

- crear trabajos
- editar trabajos

### `trabajos.crear`

Permite:

- entrar a `/trabajos/nuevo`
- guardar presupuestos / trabajos nuevos

No implica:

- editar trabajos existentes

### `trabajos.editar`

Permite:

- modificar datos de trabajos existentes
- guardar cambios en presupuestos / trabajos ya creados

### `clientes.acceso`

Permite acceso completo de solo lectura al módulo de clientes:

- entrar al listado de clientes
- buscar clientes
- ver clientes en modo solo lectura

No permite:

- crear clientes
- editar clientes
- eliminar clientes

> Nota: el permiso se llama `clientes.acceso` y no `clientes.acceso` para no implicar que existen o existirán `clientes.crear` y `clientes.editar`. Si en el futuro se necesita granularidad, se agregan permisos nuevos y se migra.

## Módulos bloqueados para operarios en esta etapa

Aunque el modelo quede preparado para crecer, por ahora el operario no debe tener acceso a:

- `Precios`
- `Repuestos`
- `Configuración`
- `Información técnica`
- `Gestión de usuarios`
- `Mantenimiento`

## Diseño técnico propuesto

## 1. Roles

Unificar el sistema de roles a:

- `super_admin`
- `operario`

Mapeo recomendado desde el estado actual:

- usuarios `admin` y `superuser` actuales -> `super_admin`
- usuarios `operador` actuales -> `operario`

## 2. Persistencia de permisos

Agregar una tabla de permisos por usuario.

Opción recomendada:

- tabla: `usuario_permisos`
- columnas:
  - `usuario_email` o `usuario_id`
  - `permiso`
  - `created_at`

Ejemplo de filas:

- `operario1@dominio.com` + `trabajos.ver`
- `operario1@dominio.com` + `trabajos.crear`

Ventajas:

- no hace falta inventar más roles
- permite agregar nuevos permisos en el futuro sin rediseñar la base
- simplifica la UI de switches

## 3. Helpers centralizados

Crear helpers en auth/permisos para dejar de depender de checks manuales por role.

Helpers propuestos:

- `getSessionPermissions()`
- `hasPermission(session, permission)`
- `requirePermission(permission)`
- `canAccessClientesReadOnly(session)`

Regla base:

- si `session.role === "super_admin"` -> acceso total
- si `session.role === "operario"` -> validar contra permisos asignados

## 4. Reemplazo de checks existentes

Hoy el proyecto usa lógica como:

- `role === "admin" || role === "superuser"`
- `role !== "operador"`

Eso debe migrarse a helpers de permiso.

Objetivo:

- no esconder solo botones
- bloquear también del lado servidor
- dejar coherencia entre UI, páginas, actions y APIs

## Pantalla de usuarios

## Comportamiento esperado en `/admin/usuarios`

- si el usuario editado es `super_admin`, mostrar acceso total
- si el usuario editado es `operario`, mostrar switches de permisos

Switches iniciales:

- `Ver trabajos`
- `Crear presupuestos / trabajos`
- `Editar presupuestos / trabajos`
- `Ver listado de clientes`

## Reglas de edición

- solo `super_admin` puede crear operarios y editar sus permisos
- `super_admin` puede modificar permisos en cualquier momento
- `super_admin` puede crear dos operarios con combinaciones distintas de permisos

## Implementación por etapas

## Etapa 1. Modelo y migración

- definir los roles finales: `super_admin` y `operario`
- crear migración para tabla de permisos
- migrar usuarios existentes al nuevo modelo
- asignar preset por defecto a operarios actuales si corresponde

## Etapa 2. Auth y helpers

- actualizar la sesión para trabajar con el nuevo rol
- agregar helpers de permisos reutilizables
- centralizar checks en utilidades comunes

## Etapa 3. Seguridad server-side

- proteger páginas con permisos
- proteger server actions con permisos
- proteger route handlers con permisos
- evitar que una URL directa o un POST manual salteen restricciones

## Etapa 4. Ajustes de UI

- ocultar accesos no permitidos en menú y pantallas
- mostrar modo solo lectura donde corresponda
- deshabilitar botones de crear/editar cuando falte permiso

## Etapa 5. Gestión de usuarios

- actualizar `/admin/usuarios`
- mostrar switches para operarios
- persistir cambios de permisos
- aplicar preset inicial al crear un operario

## Etapa 6. Validación final

Probar estos escenarios:

- `super_admin` ve todo y hace todo
- `operario` base puede ver trabajos y crear trabajos
- `operario` base no puede editar trabajos existentes
- `operario` base no puede entrar a clientes
- `operario` con `clientes.acceso` puede ver clientes en modo lectura
- `operario` no puede entrar a `precios`
- `operario` no puede entrar a `repuestos`
- `operario` no puede entrar a `configuracion`
- acciones protegidas fallan correctamente si no tiene permiso

## Archivos del repo que probablemente vamos a tocar

Auth y sesión:

- `src/lib/auth.ts`
- nuevos helpers de permisos en `src/lib/`

Usuarios:

- `src/app/(app)/admin/usuarios/page.tsx`
- `src/app/(app)/admin/usuarios/actions.ts`
- `src/app/(app)/admin/usuarios/UsuariosClient.tsx`
- queries de usuarios en `src/lib/queries/usuarios`

Páginas y módulos con acceso condicionado:

- `src/app/(app)/layout.tsx`
- `src/app/(app)/trabajos/page.tsx`
- `src/app/(app)/trabajos/nuevo/page.tsx`
- `src/app/(app)/trabajos/[id]/page.tsx`
- `src/app/(app)/clientes/page.tsx`
- `src/app/(app)/clientes/[id]/page.tsx`
- `src/app/(app)/clientes/nuevo/page.tsx`
- `src/app/(app)/precios/page.tsx`
- `src/app/(app)/repuestos/page.tsx`
- `src/app/(app)/configuracion/page.tsx`
- `src/app/(app)/informacion-tecnica/page.tsx`

APIs:

- `src/app/api/clientes/search/route.ts`
- `src/app/api/trabajos/[id]/pdf/route.ts`

## Resultado esperado

Al terminar:

- el sistema tendrá solo `super_admin` y `operario`
- los operarios tendrán permisos configurables por switches
- el `super_admin` podrá crear operarios con distintos alcances
- los accesos estarán controlados de forma consistente en UI y servidor
- la base quedará lista para agregar más permisos si hiciera falta más adelante
