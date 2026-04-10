# Recticar Presupuestos

Aplicación web para gestión de presupuestos y seguimiento de clientes de una rectificadora de motores.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Neon PostgreSQL con `@neondatabase/serverless`
- Deploy objetivo: Vercel

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:migrate
```

## Variables de entorno

Crear `.env.local` con:

```bash
DATABASE_URL=postgres://usuario:password@host/db
```

## Migraciones

Las migraciones SQL están en `migrations/` y se ejecutan con:

```bash
npm run db:migrate
```

El runner registra cada archivo aplicado en la tabla `schema_migrations`.

## Alcance implementado en esta etapa

- Dashboard inicial
- Listado de clientes con búsqueda
- Listado de pedidos con filtros por estado y prioridad
- Conexión server-side a Neon
- Capa de queries SQL directas
- Migración inicial para `clientes`, `pedidos` y `pedido_trabajos`

## Supuestos actuales

- Las tablas existentes `marcas`, `modelos`, `motores`, `modelo_motor`, `categorias_trabajo` y `trabajos` usan `id` como PK.
- Para los listados se asume que `marcas`, `modelos` y `motores` tienen una columna `nombre`.
- Para futuros formularios se asume que `trabajos.categoria_id` referencia a `categorias_trabajo.id`.

