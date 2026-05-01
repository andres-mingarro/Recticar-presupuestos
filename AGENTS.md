<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Before writing or changing Next.js app code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repo Notes

This repo also has a richer product and implementation guide in `CLAUDE.md`. Treat it as project context and keep this file aligned with it.

## Project Snapshot

- Internal app for managing engine rectification jobs.
- Authenticated employees use it; it is not a customer-facing app.
- Main stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, SCSS Modules, PostgreSQL via Neon serverless.
- Supporting libraries: `@neondatabase/serverless`, `qrcode`, Font Awesome via `src/components/ui/Icon`.
- No ORM. Database access is done with direct SQL through `queryRows<T>()`.

## Databases

- `DATABASE_URL`: main database for users, clients, jobs, prices, and operational data.
- `TECHNICAL_DATABASE_URL`: external technical catalog used by technical selection flows. If missing, code falls back to `DATABASE_URL`.
- The main database should not depend on foreign keys to the technical catalog for persisted jobs.
- Expected technical catalog tables: `marcas`, `modelos`, `motores`, `vehiculos`.

## Required UI Conventions

- Every component must include its component name as a root `className`.
- Components live in their own folder with `index.ts` and a colocated `*.module.scss`.
- Prefer existing shared UI before inventing new patterns: `Card`, `Button`, `Badge`, `Table`, `PageHeader`.
- Do not use raw icon SVGs when the app already supports the same icon through `src/components/ui/Icon`.
- Do not use native `<button>` styling directly when `Button` or `PulsatingButton` should be used.

## Forms And Saving

- Changes in detail screens are saved with a single `"Guardar"` action. No autosave and no per-widget save buttons.
- Widgets rendered outside the main `<form>` must submit through hidden inputs using `form={formId}`.
- In job detail flows, `useActionState` is lifted when the parent needs `isPending`.
- Dirty state is typically set with `onClickCapture` for toggles and `onInput` for forms, then reset once submit becomes pending.

## Important UI Components

- `Button` in `src/components/ui/Button/Button.tsx` is the standard button abstraction.
- `PulsatingButton` wraps `Button` and is the preferred save CTA when dirty state should be highlighted.
- `Spinner` is the standard pending indicator inside save buttons.
- Use `ConfirmDialog` instead of `window.confirm()`.
- `EstadoStepper` has clickable form mode and read-only display mode.

## Money And Data Rules

- Monetary amounts are displayed and persisted as integers, with no decimals.
- Job spare parts persist `precio` and `cantidad` in `trabajo_repuestos`.
- The `entregado` enum value exists in PostgreSQL but is not currently used in the UI.

## Route Map

- `src/app/(app)/clientes`: client list with autocomplete and pagination.
- `src/app/(app)/clientes/[id]`: client detail with editable accordion and separated job cards.
- `src/app/(app)/trabajos`: job list.
- `src/app/(app)/trabajos/nuevo`: new job flow using the technical catalog.
- `src/app/(app)/trabajos/[id]`: job detail edit screen with unified save flow.
- `src/app/(app)/trabajos/[id]/etiqueta`: print label view with QR.
- `src/app/(app)/precios`: price administration and grouped adjustments.
- `src/app/(app)/informacion-tecnica`: technical catalog administration.
- `src/app/(app)/admin/usuarios`: user, role, permission, and home-screen administration.
- `src/app/api/clientes/search`: client autocomplete endpoint.

## Job Detail Architecture

- `src/components/pages/TrabajoDetailPage/TrabajoDetailPage.tsx` is a client component that centralizes edit-screen state.
- It coordinates `CobradoProvider`, `PrioridadProvider`, `RepuestosSeleccionProvider`, and `TrabajosSeleccionProvider`.
- `TrabajoForm` supports external action state through `externalFormAction`, `externalState`, and `externalIsPending`.
- Sidebar and summary components are expected to react to shared context rather than duplicate local state.

## Print And QR Notes

- QR SVG generation lives in `src/lib/qr.ts` through `generateQrSvg()`.
- Base URL uses `NEXT_PUBLIC_BASE_URL`, defaulting to `http://localhost:3000`.
- The print wrapper must use the stable `id="etiqueta-qr-print"`.
- Global print CSS belongs in `src/app/globals.css`, scoped via `body:has(#etiqueta-qr-print)`.
- Avoid pure global selectors inside CSS Modules for print logic because the build fails on non-pure selectors.

## Database And Runtime Notes

- Migrations live in `migrations/` and are applied with `npm run db:migrate`.
- Pages that read from the database should use `export const dynamic = "force-dynamic"` where the app already expects dynamic DB-backed rendering.
- Server actions are defined inline in page files with `"use server"`.
- `redirect()` throws internally in Next.js, so do not wrap it in `try/catch`.
- Environment variables expected in `.env.local`: `DATABASE_URL`, `TECHNICAL_DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`.

## Roles And Permissions

- Roles: `super_admin` and `operario`.
- `.env` bootstrap credentials (`ADMIN_USER`, `ADMIN_PASSWORD`) map to `super_admin`.
- Permission helpers live in `src/lib/permisos.ts`.
- Known app permissions:
  - `trabajos.ver`
  - `trabajos.crear`
  - `trabajos.editar`
  - `clientes.acceso`
- Default new operario permissions: `trabajos.ver` and `trabajos.crear`.
- Restricted modules for operarios include `precios`, `repuestos`, `configuracion`, `informacion-tecnica`, and `admin/usuarios`.
- Home screen preference is stored as `pantalla_inicio` with values `dashboard`, `trabajos`, or `clientes`.

## High-Value Files

- `src/app/(app)/trabajos/[id]/page.tsx`
- `src/components/pages/TrabajoDetailPage/TrabajoDetailPage.tsx`
- `src/components/forms/TrabajoForm/TrabajoForm.tsx`
- `src/components/forms/ClienteForm/ClienteForm.tsx`
- `src/components/forms/DeleteItemForm/DeleteItemForm.tsx`
- `src/components/ui/Button/Button.tsx`
- `src/components/ui/Dialog/Dialog.tsx`
- `src/components/ui/ConfirmDialog/ConfirmDialog.tsx`
- `src/components/pages/InformacionTecnicaPage/components/shared.tsx`
- `src/lib/queries/trabajos.ts`
- `src/lib/queries/catalogo.ts`
- `src/lib/qr.ts`
- `src/lib/pdf/PresupuestoPdf.tsx`
- `src/app/api/trabajos/[id]/pdf/route.ts`
- `src/lib/types.ts`
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/lib/permisos.ts`
- `src/lib/queries/usuarios.ts`
- `src/middleware.ts`

## Working Agreement

- Check `CLAUDE.md` when touching product behavior, permissions, jobs flow, pricing, technical catalog, or UI conventions that are easy to break.
- Preserve the existing warm visual language and shared component system unless the task explicitly requires a redesign.
- Keep this file synchronized with `CLAUDE.md` when new repo-wide conventions are added.

## Optimization And Refactor Skill

Use this section when asked to optimize queries, reduce code size, refactor large files, remove duplication, or simplify implementation.

### General Refactor Rules

- Preserve existing behavior unless the task explicitly asks to change it.
- Prefer small, reviewable changes over large rewrites.
- Do not introduce new dependencies unless clearly justified.
- Do not change public APIs, route behavior, permissions, database schema, or UI flows without explaining the reason.
- Reduce code only when readability stays the same or improves.
- Avoid clever one-liners that make debugging harder.
- Prefer deleting duplicated logic before extracting new abstractions.
- Keep naming explicit and consistent with the current repo language.
- Keep the warm visual language and existing shared component system.

### Large File Refactor Rules

Before editing a large file:

1. Identify the main responsibilities of the file.
2. Find duplicated state, duplicated rendering logic, repeated SQL, repeated form handling, or repeated UI blocks.
3. Check whether existing shared components already solve the problem.
4. Propose the smallest safe refactor.
5. Apply changes incrementally.
6. Keep server/client component boundaries valid for Next.js App Router.
7. Preserve existing form submission behavior, especially unified "Guardar" flows.

When refactoring React components:

- Keep each component root `className` with the component name.
- Use existing shared UI components first: `Card`, `Button`, `Badge`, `Table`, `PageHeader`, `ConfirmDialog`, `Spinner`.
- Do not replace `Button` or `PulsatingButton` with raw `<button>` styling.
- Do not use raw icon SVGs if `src/components/ui/Icon` supports the icon.
- Do not move widgets outside forms unless hidden inputs and `form={formId}` behavior are preserved.

### Query Optimization Rules

When optimizing SQL or DB access:

1. Understand the query purpose before changing it.
2. Preserve exact returned data shape expected by TypeScript types.
3. Look for:
   - N+1 queries
   - duplicated queries
   - unnecessary joins
   - `SELECT *`
   - filters applied in JS that should be done in SQL
   - repeated subqueries
   - inefficient pagination
   - expensive `ORDER BY`, `GROUP BY`, or `ILIKE`
   - loading unnecessary columns
4. Prefer clear SQL over clever SQL.
5. Suggest indexes only when justified by `WHERE`, `JOIN`, `ORDER BY`, or `GROUP BY`.
6. Do not add foreign keys from the main database to the technical catalog.
7. Do not introduce an ORM.
8. Keep using direct SQL through `queryRows<T>()`.
9. If changing a query, explain before/after behavior and any expected performance impact.

### Neon / PostgreSQL Rules

- Treat `DATABASE_URL` as the main operational database.
- Treat `TECHNICAL_DATABASE_URL` as an external technical catalog.
- If optimizing technical catalog flows, keep fallback behavior to `DATABASE_URL` when `TECHNICAL_DATABASE_URL` is missing.
- Migrations must go in `migrations/`.
- Do not change schema silently.
- If schema changes are needed, explain the migration and how to run `npm run db:migrate`.

### Less Lines Rules

When asked to make code shorter:

- Remove duplicated branches first.
- Replace repeated mapping/rendering logic with small helpers only when it improves clarity.
- Avoid abstracting too early.
- Do not compress code in a way that hides business rules.
- Keep important TypeScript types explicit.
- Keep error handling readable.
- Prefer fewer concepts, not just fewer lines.

### Review Output Format

After completing optimization or refactor work, respond with:

1. Summary
2. Files changed
3. What was simplified
4. Query/performance improvements, if any
5. Behavior preserved
6. Risks or assumptions
7. Commands run
8. Suggested next refactor