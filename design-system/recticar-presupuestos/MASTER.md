# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Recticar Presupuestos
**Generated:** 2026-04-21
**Category:** Internal operations tool — authenticated employees, not customer-facing

---

## Stack

- **Framework:** Next.js 15 App Router + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + SCSS Modules per component
- **Icons:** Font Awesome via `src/components/ui/Icon` — no inline SVG
- **DB:** PostgreSQL (Neon serverless), no ORM, `queryRows<T>()`

> **Rule:** Tailwind first for everything. SCSS only for things Tailwind can't do (e.g., `cm` units in print).

---

## Color Palette

These CSS variables are defined in `src/scss/globals.css`:

| Token | Value | Role |
|-------|-------|------|
| `--orange-vivid` | warm vivid orange | Primary actions, CTA |
| `--peach-soft` | soft peach | Hover states, tints |
| `--cream-warm` | warm cream | Backgrounds, cards |
| `--apricot-light` | light apricot | Subtle fills |
| `--brown-burnt` | burnt brown | Dark accents, borders |

**Button gradient combinations:** `primary`, `warm`, `burnt`, `secondary` (defined in Button component).

**Never** use purple, violet, or cold blues — the visual language is warm/earthy throughout.

---

## Typography

- **Font stack:** System fonts + Tailwind defaults (no Google Fonts imported)
- **Body min size:** 16px on mobile
- **Line height:** 1.5–1.75 for body text
- **Line length:** 65–75 chars max

---

## Spacing

| Token | Value |
|-------|-------|
| `--space-xs` | `4px` / `0.25rem` |
| `--space-sm` | `8px` / `0.5rem` |
| `--space-md` | `16px` / `1rem` |
| `--space-lg` | `24px` / `1.5rem` |
| `--space-xl` | `32px` / `2rem` |
| `--space-2xl` | `48px` / `3rem` |

---

## Shadow Depths

| Level | Usage |
|-------|-------|
| `--shadow-sm` | Subtle lift |
| `--shadow-md` | Cards, buttons |
| `--shadow-lg` | Modals, dropdowns |
| `--shadow-xl` | Hero images, featured cards |

---

## Component System

All components in `src/components/` organized as:
```
src/components/
  ui/          Button, Card, Badge, Table, PageHeader, Dialog, ConfirmDialog, Icon, Spinner, PulsatingButton
  forms/       TrabajoForm, ClienteForm, DeleteItemForm
  pages/       TrabajoDetailPage, InformacionTecnicaPage, RepuestosPage, ...
  layout/
  navigation/
  search/
  pagination/
  sortable/
```

**Every component root element must include the component name as a className.**
Example: `<div className="CobradoToggle flex-1">`

### Buttons

Use `<Button>` (never `<button>` directly):
- Variants: `primary`, `secondary`, `ghost`, `dark`, `warm`, `burnt`, `outline`, `outline-warm`, `outline-dark`, `outline-ghost`, `danger-ghost`, `link`
- Sizes: `sm`, `md`, `lg`
- Props: `icon` (left), `iconRight`, `as="a"` + `href`
- Use `buttonStyles()` when only className is needed (e.g., on Next.js `<Link>`)

**Save button in tables/editable rows:** border-gray-style bg-white (see `saveRowBtnCls` in `shared.tsx`)
**Cancel:** `outline-ghost` with X icon
**Delete:** `outline-ghost` with trash icon + `ConfirmDialog`

Use `<PulsatingButton>` as the primary save CTA when dirty state should be highlighted.
Use `<Spinner>` inside save buttons while `isPending`.

### Cards

Reuse `<Card>` before creating new styles.

### Dialogs

- `<Dialog>` — bottom sheet (`variant="sheet"`) or centered modal (`variant="centered"`)
- `<ConfirmDialog>` — always use instead of `window.confirm()`

### Estado / Prioridad / Cobrado

- `EstadoStepper` — clickable form mode
- `EstadoStepperDisplay` — read-only
- `CobradoToggle`, `PrioridadToggle` — widgets outside `<form>` submit via hidden inputs with `form={formId}`

### Badges

`StatusBadge`, `PriorityBadge`, `PaymentBadge`, `ContactBadge`, `BusinessDaysBadge` in `src/components/ui/Badge/Badge.tsx`

---

## Forms & Saving

- Single "Guardar" button — no autosave, no per-widget save
- Widgets outside `<form>` use `<input type="hidden" name="..." form={formId} />`
- `useActionState` lifted to parent when parent needs `isPending`
- Dirty state: `onClickCapture` for toggles, `onInput` for forms; reset via `useEffect` when `isPending` → true

---

## Monetary Values

- All amounts displayed and persisted as **integers** (no decimals)

---

## Roles & Permissions

- Roles: `super_admin`, `operario`
- Permission helpers: `src/lib/permisos.ts`
- Restricted for operarios: `precios`, `repuestos`, `configuracion`, `informacion-tecnica`, `admin/usuarios`

---

## Anti-Patterns

- ❌ Purple, violet, cold blues — warm palette only
- ❌ Inline SVG icons — use `src/components/ui/Icon`
- ❌ Native `<button>` without `<Button>` wrapper
- ❌ `window.confirm()` — use `<ConfirmDialog>`
- ❌ Auto-save or per-widget save — single Guardar only
- ❌ Pure global selectors in CSS Modules (build fails)
- ❌ Decimals in monetary amounts
- ❌ Missing component name as root className
- ❌ Low contrast text (4.5:1 minimum)
- ❌ Instant state changes — use transitions (150–300ms)
- ❌ Layout-shifting hovers — no scale transforms
- ❌ Missing `cursor-pointer` on interactive elements

---

## Pre-Delivery Checklist

- [ ] Component root has component name as className
- [ ] Icons go through `src/components/ui/Icon`
- [ ] No native `<button>` — using `<Button>` or `<PulsatingButton>`
- [ ] Save flow uses single "Guardar" + `PulsatingButton` + `Spinner`
- [ ] Monetary values stored/displayed as integers
- [ ] Warm color palette only (no purple/violet/cold)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] `ConfirmDialog` instead of `window.confirm()`
