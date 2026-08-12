<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Arquitectura del frontend

Antes de crear o mover componentes, lee `docs/documentation/frontend-architecture.md`: define las capas (`app/` compone, `features/<dominio>/` lógica de negocio, `ui/` primitivas PascalCase, `lib/` datos) y las reglas del proyecto.

Reglas no negociables (establecidas en el refactor 2026-07):
- Los sub-componentes de una página van en `features/<dominio>/`, **nunca inline** dentro de `page.tsx` (que debe leerse como composición).
- Archivos de `ui/` en **PascalCase**; sin lógica de dominio.
- Iconos de categoría: usar `CATEGORY_ICON_MAP` de `lib/utils/categoryIcons.ts` — no crear maps locales.
- Lo común entre dominios va en `features/shared/`, sin forzar abstracciones.
- No mezclar la capa de datos (`lib/api`, `lib/hooks`, `stores`) con presentación.
