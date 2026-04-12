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
npm run db:reset:dev
npm run db:seed:dev
```

## Variables de entorno

Crear `.env.local` con:

```bash
DATABASE_URL=postgres://usuario:password@host/db
TECHNICAL_DATABASE_URL=postgres://usuario:password@host/db-catalogo
```

`TECHNICAL_DATABASE_URL` se usa para la información de selección técnica. Si no está definida, la app usa `DATABASE_URL` como fallback.

La base técnica externa hoy se espera con este esquema:

```text
marcas(id, nombre)
modelos(id, nombre, marca_id)
motores(id, nombre, cilindrada)
vehiculos(id, modelo_id, motor_id)
```

La base principal guarda `marca_id`, `modelo_id` y `motor_id` en `pedidos`, pero ya no depende de foreign keys al catálogo técnico local.

## Migraciones

Las migraciones SQL están en `migrations/` y se ejecutan con:

```bash
npm run db:migrate
```

El runner registra cada archivo aplicado en la tabla `schema_migrations`.

La migración `010_drop_technical_foreign_keys.sql` desacopla `pedidos` del catálogo técnico local para poder usar una base externa.

## Desarrollo

Reset completo de la base principal:

```bash
npm run db:reset:dev
```

Esto limpia:

- `pedido_trabajos`
- `pedidos`
- `clientes`
- `marcas`
- `modelos`
- `motores`
- `modelo_motor`

Seed de desarrollo:

```bash
npm run db:seed:dev
```

El seed toma combinaciones de marca, modelo y motor desde `TECHNICAL_DATABASE_URL`.

## Alcance implementado en esta etapa

- Dashboard inicial
- Listado de clientes con búsqueda
- Listado de pedidos con filtros por estado y prioridad
- Conexión server-side a Neon
- Capa de queries SQL directas
- Migración inicial para `clientes`, `pedidos` y `pedido_trabajos`

## Supuestos actuales

- La base técnica externa usa `marcas`, `modelos`, `motores` y `vehiculos` con `id` como PK.
- Para los listados se asume que `marcas`, `modelos` y `motores` tienen una columna `nombre`.
- Para relacionar modelo y motor en la base técnica se usa `vehiculos(modelo_id, motor_id)`.
- Para futuros formularios se asume que `trabajos.categoria_id` referencia a `categorias_trabajo.id`.
