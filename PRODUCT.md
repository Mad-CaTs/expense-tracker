# Product

## Register

product

## Users

Usuario individual que gestiona gastos personales en español. Accede principalmente desde móvil durante el día (registrar un gasto reciente) y desde desktop para revisar reportes y presupuestos. Usuario con criterio, no novato: quiere claridad sobre sus números sin que la app le explique lo obvio.

## Product Purpose

Rastreador de gastos personales con backend Spring Boot. El usuario registra gastos, define presupuestos por categoría, y revisa reportes por período. El éxito es una sesión de 30 segundos para registrar un gasto, o 2 minutos para entender en qué está gastando de más.

## Brand Personality

Premium, minimalista, directa. La app no celebra ni dramatiza: muestra los números, deja que el usuario saque sus conclusiones. Confianza a través de la precisión, no de la decoración.

## Anti-references

- Neon crypto / exchanges de criptomonedas: colores eléctricos, gradientes agresivos
- Apps bancarias corporativas: navy formal, sin personalidad, sin calidez
- Dashboard SaaS genérico: Inter font, grids Bootstrap simétricos, tarjetas idénticas con icono+título+texto

## Design Principles

1. **Los números son la UI.** Los datos financieros tienen la jerarquía más alta. Nunca compitan con decoración.
2. **Silencio activo.** El espacio vacío no es ausencia de diseño, es parte del diseño. No llenar cada píxel.
3. **Feedback sin drama.** Estados de error, warning y success comunican sin alarmar. El color semántico es información, no emoción.
4. **Mobile-first de verdad.** El flujo de registro de gasto debe ser completable con el pulgar, sin scroll.
5. **Precisión sobre expresividad.** Cuando hay tensión entre una elección visual llamativa y una más precisa, gana la precisión.

## Accessibility & Inclusion

- WCAG AA mínimo
- Focus rings visibles (gold #d4af37)
- Color semántico siempre acompañado de texto o icono (nunca solo rojo para error)
- Reduced motion: respetar `prefers-reduced-motion`
