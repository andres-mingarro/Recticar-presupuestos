---
name: recticar
description: "Use this custom agent when working on the Recticar presupuestos app: Next.js 15 App Router, React 19, TypeScript, Tailwind v4, SCSS Modules, PostgreSQL, SQL directo y un solo botón Guardar en formularios."
---

# Agente Recticar

Este agente está diseñado para el proyecto interno de gestión de pedidos de rectificación de motores.

## Cuándo usarlo

- Cuando trabajes en el frontend de `src/app/**`, `src/components/**` y `src/lib/**`
- Al editar rutas, formularios, componentes de UI, providers de contexto o server actions
- Al cambiar la base de datos o migraciones SQL en `migrations/`
- Al revisar convenciones de estilo, clases `className` y SCSS Modules
- Al necesitar respetar la arquitectura específica de `PedidoDetailPage`, `PedidoForm` y los proveedores de estado

## Qué sabe este agente

- La app usa Next.js 15 App Router con `export const dynamic = "force-dynamic"` en páginas que leen DB
- Las acciones de servidor están definidas inline con `"use server"`
- No hay ORM: SQL directo con `queryRows<T>()`
- Las rutas clave son `clientes`, `pedidos`, `precios`, `informacion-tecnica`, `repuestos`
- La edición de pedido centraliza `cobrado`, `prioridad`, `estado` y el formulario bajo un único botón `Guardar`
- Los valores monetarios se guardan como enteros sin decimales
- El catálogo técnico externo usa `TECHNICAL_DATABASE_URL` y tiene tablas `marcas`, `modelos`, `motores`, `vehiculos`
- El código CSS de impresión usa `body:has(#etiqueta-qr-print)` en `src/app/globals.css`

## Preferencias de herramientas

- Usa `read_file`, `list_dir`, `file_search`, `grep_search` y `search` para explorar el código primero
- Usa `replace_string_in_file`, `multi_replace_string_in_file` o `create_file` para cambios precisos
- Usa `run_in_terminal` solo para validar con comandos de proyecto (`npm run`, `npm test`, `npm run db:migrate`)
- Evita cambios que rompan la convención de componentes con carpeta propia y `*.module.scss`

## Ejemplos de uso

- "Corrige el formulario de `PedidoForm` para que envíe correctamente los toggles con `input type=hidden form={formId}`."
- "Añade una nueva ruta bajo `src/app/(app)/pedidos/` con server action y mantén la arquitectura del AppShell."
- "Refactoriza un componente UI para usar `Button`, `Card` y `Badge` en lugar de estilos inline."

## Nota

Lee `AGENTS.md` y `CLAUDE.md` antes de hacer cambios significativos para respetar las reglas de este repositorio.
