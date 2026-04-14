# Copilot Instructions for Recticar Presupuestos

This repository is an internal Next.js 15 App Router application for managing engine rectification orders.

## Key project conventions

- Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, SCSS Modules, PostgreSQL, direct SQL with `queryRows<T>()`.
- Do not use an ORM. Database code should use raw SQL queries in `src/lib/db.ts` and query helpers in `src/lib/queries/`.
- Every component should live in its own folder under `src/components/` and use a matching `*.module.scss` file.
- Components should set their root element `className` to the component name, e.g. `className="CobradoToggle"`.
- Prefer existing UI primitives like `Button`, `Card`, `Badge`, `PageHeader`, `Spinner`, `PulsatingButton`, `ButtonGroup`, `Incrementor`, `CobradoToggle`, `PrioridadToggle`, and `EstadoStepper`.
- Do not add inline SVG icons; use `src/components/ui/Icon`.
- Monetary amounts are stored as integers without decimals.
- Forms are saved using a single `Guardar` button, never auto-save or multiple independent save actions.
- Toggles outside the form use hidden inputs with `form={formId}` to submit their values.

## Architecture notes

- `PedidoDetailPage` is a client component that centralizes state for pedido editing.
- `PedidoForm` often accepts `externalFormAction`, `externalState`, and `externalIsPending` so parent components can control submit state.
- The `pedido` edit screen combines `cobrado`, `prioridad`, `estado`, and the main form under one save flow.
- Technical catalog data is loaded from `TECHNICAL_DATABASE_URL` when available; otherwise fallback to `DATABASE_URL`.
- Print/QR logic relies on `src/lib/qr.ts` and `body:has(#etiqueta-qr-print)` rules in `src/app/globals.css`.

## Routing and features

- Main app routes are under `src/app/(app)/`.
- Key pages: `clientes`, `pedidos`, `precios`, `informacion-tecnica`, `repuestos`.
- The admin/technical catalog pages are only editable by `admin` and `superuser`.
- Server actions are typically defined inline inside page files with `"use server"`.
- Use `redirect()` carefully; it throws internally and should not be wrapped in `try/catch`.

## When to use this custom agent

- When editing The Recticar project logic, routes, forms, or UI components.
- When fixing or extending SQL migrations or database query code.
- When working with the `PedidoDetailPage` and its save-state patterns.
- When making changes that must preserve project conventions and release quality.

## References

- `AGENTS.md` contains the main repo guidance.
- `.github/agents/recticar.agent.md` defines a custom agent persona for this app.
- `CLAUDE.md` contains additional project-specific notes.
