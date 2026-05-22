---
name: gastos
description: Rastreador de gastos personales — dark premium, acento dorado, datos primero
colors:
  void-black: "#080808"
  surface-base: "#0e0e0e"
  surface-raised: "#111111"
  surface-subtle: "#141414"
  border-hairline: "#1c1c1c"
  border-default: "#242424"
  text-primary: "#e8e6db"
  text-secondary: "#808080"
  text-muted: "#484848"
  text-ghost: "#2a2a2a"
  gold-deep: "#c9a227"
  gold-mid: "#d4af37"
  gold-light: "#f0d060"
  danger: "#ef4444"
  success: "#4ade80"
  warning: "#f97316"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontFeature: "\"tnum\""
rounded:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "17px"
  xl: "19px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, #d4af37, #f0d060)"
    textColor: "#060606"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "linear-gradient(135deg, #d4af37, #f0d060)"
    textColor: "#060606"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface-base}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
---

# Design System: gastos

## 1. Overview

**Creative North Star: "El Terminal Financiero"**

Un sistema que trata los datos financieros como lo que son: información de precisión. La interfaz no decora ni celebra; indexa, muestra, y sale del camino. La densidad es un signo de respeto al usuario, no de descuido.

El fondo es casi void: `#080808`, con superficie elevada en `#0e0e0e` y `#111`. La jerarquía se comunica únicamente a través de diferencial de color de fondo — nunca con bordes decorativos. El acento dorado (`#d4af37 → #f0d060`) cumple exactamente una función: marcar el estado activo y las acciones primarias. Su rareza es su poder.

Este sistema rechaza explícitamente: el neon de fintech cripto, el navy corporativo bancario, y el grid Bootstrap simétrico del SaaS genérico. Si se ve como Inter + gris neutro + tarjetas idénticas, ha fallado.

**Key Characteristics:**
- Datos primero: los números tienen la mayor jerarquía tipográfica
- Elevación tonal: profundidad sin sombras en superficies estáticas
- Gold como señal, no como decoración
- Tipografía Geist con monospace para cifras
- Bezel doble en inputs y cards premium: outer shell + inner core

## 2. Colors

Una paleta void-to-charcoal con un solo acento metálico. El constraint es la estrategia.

### Primary
- **Oro Metálico Deep** (`#d4af37`): Acciones primarias, estado activo en navegación, progress bars en estado normal. Nunca usado como fondo de superficie grande.
- **Oro Metálico Light** (`#f0d060`): Extremo del gradiente dorado. Solo en combinación con Gold Deep, nunca solo.
- **Oro Intenso** (`#c9a227`): Hover del texto dorado, inicio del gradiente en texto.

### Neutral
- **Void Black** (`#080808`): Fondo base del documento. Nunca `#000` puro.
- **Surface Base** (`#0e0e0e`): Interior de cards — el nivel más bajo de superficie visible.
- **Surface Raised** (`#111111`): Sidebar, nav inferior, cards secundarias.
- **Surface Subtle** (`#141414`): Hover de filas, fondos de inputs.
- **Border Hairline** (`#1c1c1c`): Separadores, bordes de componentes en reposo.
- **Border Default** (`#242424`): Bordes activos, outline de componentes focuseados (además del gold ring).
- **Text Primary** (`#e8e6db`): Todo texto de contenido principal. Ligeramente cálido, no blanco puro.
- **Text Secondary** (`#808080`): Labels secundarios, metadatos, timestamps.
- **Text Muted** (`#484848`): Placeholders, texto muy secundario.
- **Text Ghost** (`#2a2a2a`): Footers legales, microcopy casi invisible.

### Semantic
- **Danger** (`#ef4444`): Errores, gastos que exceden presupuesto. Siempre acompañado de texto.
- **Success** (`#4ade80`): Confirmaciones, variación positiva vs. período anterior.
- **Warning** (`#f97316`): Presupuesto cercano al límite (> 80%).

**La Regla del Acento Único.** El dorado aparece en ≤ 10% de cualquier pantalla. Su escasez es su señal. Cuando todo es dorado, nada es dorado.

**La Regla del Semantic Accesible.** Color semántico nunca solo: danger siempre con icono o prefijo textual, nunca solo rojo.

## 3. Typography

**Display / Body Font:** Geist (Vercel) — sans-serif geométrico de precisión con excelente legibilidad en tamaños pequeños  
**Mono Font:** Geist Mono — para cifras financieras, tabular-nums activado

**Character:** La combinación prioriza claridad a densidades medias. Sin serif para el contexto de app dashboard; Geist tiene suficiente personalidad para no sentirse genérico.

### Hierarchy
- **Display** (800, clamp 28–36px, lh 1.1, ls -0.03em): KPIs principales, totales de período. Aparece en máximo 1-2 elementos por pantalla.
- **Headline** (700, 22px, lh 1.2, ls -0.02em): Títulos de página en desktop. Siempre tracking negativo.
- **Title** (600, 13px, lh 1.4): Nombres de gastos, nombres de presupuestos. Sin decoración.
- **Body** (400–500, 13px, lh 1.5): Texto de soporte. Máximo 65ch de ancho en bloques narrativos.
- **Label** (600, 9–10px, ls 0.18em, UPPERCASE): Labels de inputs, eyebrow tags de KPIs. Espaciado amplio para escala pequeña.
- **Mono** (500, Geist Mono, tabular-nums): Todos los montos monetarios. Sin excepción.

**La Regla del Mono Financiero.** Cualquier cifra con símbolo de moneda usa Geist Mono con `font-variant-numeric: tabular-nums`. Las columnas de números deben alinearse visualmente al centésimo.

## 4. Elevation

Sistema tonal puro: la profundidad se comunica exclusivamente por diferencial de color de fondo. Sin `box-shadow` en elementos estáticos.

Las sombras aparecen únicamente en: modals, dropdowns, tooltips — elementos flotantes que interrumpen el flujo. Su color lleva tinte oscuro sin pureza negra.

El bezel doble es el patrón de elevación para cards y inputs premium: outer shell con `border: 1px solid #1c1c1c` + inner core con `box-shadow: inset 0 1px 1px rgba(255,255,255,0.04)`. Simula un panel de vidrio en una carcasa mate.

### Shadow Vocabulary
- **Flotante** (`0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`): Modals y overlays. Nunca en cards.
- **Inset Highlight** (`inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)`): Inner core del bezel doble. Aplicado con clase CSS `.inset-highlight`.

**La Regla Flat-By-Default.** Toda superficie está plana en reposo. El hover cambia el color de fondo, no añade sombra. Las sombras son para elementos que flotan sobre el contenido, no para decorar.

## 5. Components

### Buttons
- **Shape:** Cápsula completa (`border-radius: 9999px`). Nunca `rounded-xl` o `rounded-lg` para botones.
- **Primary:** Gradiente dorado `linear-gradient(135deg, #d4af37, #f0d060)`, texto `#060606`. Padding `0 16px`, altura `36px`. `whileTap: scale(0.96)` con spring `stiffness: 500, damping: 30`.
- **Secondary:** Fondo `#111`, borde `#1c1c1c`, texto `#e8e6db`. Hover: `#161616` + `#242424`.
- **Ghost:** Sin fondo, texto `#808080`. Hover: fondo `#141414`, texto `#e8e6db`.
- **Danger:** Fondo `rgba(239,68,68,0.10)`, borde `rgba(239,68,68,0.20)`, texto `#ef4444`.
- **Disabled:** `opacity: 0.40`, `pointer-events: none`.
- **Loading:** Spinner `14×14px`, `border-2 border-current border-t-transparent`, `animate-spin`.

### Segmented Control (Period Selector)
- Container: `border-radius: 9999px`, `border: 1px solid #1a1a1a`, `bg: #0a0a0a`, `padding: 2px`.
- Opciones: `rounded-full`, texto `11px` semibold. Activo: `layoutId` Framer Motion con `bg-gold`, texto `#060606`. Spring `stiffness: 500, damping: 35`.

### Cards / Containers
- **Bezel doble:** Outer `rounded-[18px]`, `border: 1px solid #161616`, `bg: #0a0a0a`, `padding: 1px`. Inner `rounded-[17px]`, `bg: #0e0e0e`, `inset-highlight`.
- **Radio concéntrico:** El inner siempre es outer − 1px de radius. Nunca igual.
- **Sin box-shadow en reposo.** La profundidad viene del diferencial de fondo.

### Inputs / Fields
- **Bezel doble:** Wrapper con `border: 1px solid #1c1c1c`, `border-radius: 12px`, `padding: 1px`. Focus: `border-color: rgba(212,175,55,0.60)`. Error: `border-color: rgba(239,68,68,0.50)`.
- **Inner:** `bg: #111`, `border-radius: 10px`, `.inset-highlight`, `height: 40px`, `padding: 0 12px`.
- **Label:** 9–10px, uppercase, `letter-spacing: 0.15em`, color `#484848`.
- **Placeholder:** `#383838`.

### Navigation — Sidebar (desktop)
- Fixed left, 220px, `bg: #0e0e0e`, `border-right: 1px solid #161616`.
- Items: 13px medium, `border-radius: 12px`. Activo: `layoutId` Framer Motion, `bg: rgba(212,175,55,0.08)`, `box-shadow: inset 0 1px 0 rgba(212,175,55,0.10)`, texto `#e8e6db`, icono gold, dot indicator derecho.
- Inactivo: texto `#505050`, icono `#505050`. Hover: color `#808080`.

### Navigation — Bottom Nav (mobile)
- Fixed bottom, `bg: #0e0e0e`, `border-top: 1px solid #1c1c1c`, altura 64px.
- FAB central: `border-radius: 9999px`, `bg-gold`, 48×48px, elevado `-16px`. Ícono `+` en `#060606`.
- Activo: icono + label en `#d4af37`. Inactivo: `#484848`.

### Expense Row
- `border-bottom: 1px solid #111`. Hover: `bg: #0e0e0e`.
- Category icon: 36×36px, `border-radius: 12px`, `bg: {category.color}14`, `box-shadow: inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px {category.color}18`.
- Amount: Geist Mono, 13px bold, tabular-nums. Hover: texto `#e8e6db`.
- Acciones edit/delete: hidden, reveal en `group-hover`, `opacity: 0 → 1`.

## 6. Do's and Don'ts

### Do:
- **Do** usar Geist Mono con `tabular-nums` para todos los montos monetarios sin excepción.
- **Do** comunicar elevación con diferencial de color de fondo: `#080808 → #0e0e0e → #111`.
- **Do** aplicar el bezel doble (outer shell + inner core) en inputs y cards de primer nivel.
- **Do** usar `border-radius: 9999px` en todos los botones. Nunca `rounded-xl` o `rounded-lg` en CTAs.
- **Do** limitar el oro a acciones primarias y estado activo, máximo 10% de superficie visible.
- **Do** usar `spring { stiffness: 500, damping: 30 }` para transiciones de estado en componentes interactivos.
- **Do** acompañar todo color semántico (danger, warning) con texto o ícono.
- **Do** mantener labels de input en UPPERCASE, 9–10px, `letter-spacing: 0.15em`.

### Don't:
- **Don't** usar gradiente en texto (`background-clip: text`). El gold es sólido en texto; el gradiente solo en superficies (botones, barras).
- **Don't** usar `box-shadow` en cards estáticas. La elevación es tonal, no de sombra.
- **Don't** aplicar `backdrop-blur` a contenedores que hacen scroll. Solo en elementos fixed/sticky.
- **Don't** crear grids de tarjetas idénticas con icon+título+texto. Es el patrón SaaS genérico prohibido explícitamente.
- **Don't** usar Inter, Roboto, Open Sans o cualquier fuente que no sea Geist / Geist Mono.
- **Don't** usar navy azul corporativo, violeta, ni neon. Esta app no es una exchange de cripto ni un banco.
- **Don't** usar `border-left` colorido como accent en items de lista. Reescribir con tint de fondo.
- **Don't** mostrar errores solo con color rojo sin texto acompañante.
- **Don't** animar propiedades de layout (`top`, `left`, `width`, `height`). Solo `transform` y `opacity`.
- **Don't** usar números `z-index` mayores a las capas sistémicas: nav (30), modals (40), overlays (50).
