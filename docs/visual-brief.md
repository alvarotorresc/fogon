# Visual Brief — Fogon

> Tu cocina, organizada.
> Fecha: 2026-03-02
> Estado: Aprobado — prototipo validado el 2026-03-02

## Cambios post-validación del prototipo

- **Auth:** Solo email/contraseña en MVP. Sin Google OAuth (se añade post-MVP).
- **Recetas — 3 tipos:**
  1. **Recetas de Fogon** — colección curada que viene con la app (seed en DB)
  2. **Recetas del usuario** — creadas por el hogar (ya estaba en MVP)
  3. **"¿Qué cocino hoy?"** — el sistema sugiere recetas de la colección curada según lo que hay en la despensa (matching inteligente, % de ingredientes disponibles)

---

## Personalidad

**5 adjetivos que definen el estilo visual:**

- **Cálido** — Terracota, tierra, fuego. No frío ni estéril.
- **Práctico** — Información densa pero legible. Sin adornos que distraigan.
- **Hogareño** — Sensación de cocina propia, no de restaurante ni app corporativa.
- **Colaborativo** — Dos personas visibles en todo momento. Avatares, actividad, "quién hizo qué".
- **Moderno** — Dark mode por defecto, tipografía limpia, microinteracciones suaves.

**Tono:** Como recibir un mensaje de tu pareja diciendo "ya compré la leche". Útil, cercano, sin drama.

---

## Público objetivo

**Usuario tipo:** Pareja joven (25-40 años) que vive junta y comparte la carga de la cocina y la compra.
- Usa la app desde el móvil, frecuentemente en el supermercado o en la cocina.
- No quiere leer manuales. La curva de aprendizaje debe ser cero.
- Le frustra descubrir en el súper que ya tenía eso en casa.

**Contexto de uso:**
- En el súper: ¿qué necesito comprar? ¿ya lo compró él/ella?
- En casa: ¿qué hay en la despensa? ¿qué puedo cocinar?
- Preparando la semana: añadir ingredientes de una receta a la lista.

---

## Paleta de colores

> Dark mode por defecto. App móvil en pantallas OLED — los negros puros ahorran batería y se ven premium.

### Fondos

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-primary` | `#0A0A0A` | Fondo principal de pantallas |
| `bg-secondary` | `#111111` | Cards, tab bar, side sheets |
| `bg-tertiary` | `#1A1A1A` | Inputs, items de lista, hovers |
| `bg-elevated` | `#222222` | Modals, bottom sheets |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `text-primary` | `#EDEDED` | Texto principal, títulos |
| `text-secondary` | `#A3A3A3` | Labels, metadatos, secundario |
| `text-tertiary` | `#525252` | Placeholders, hints, disabled |

### Bordes

| Token | Hex | Uso |
|-------|-----|-----|
| `border` | `#2E2E2E` | Bordes de cards, separadores |
| `border-subtle` | `#1E1E1E` | Separadores muy sutiles |

### Colores de marca

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-blue` | `#3291FF` | Acciones primarias, botones CTA, links (dark mode variant) |
| `terracota` | `#EA580C` | Color temático Fogon (dark mode: ligeramente más claro) |
| `terracota-deep` | `#C2410C` | Color de marca oficial (light mode, logos, OG images) |
| `terracota-faint` | `#1A0C07` | Fondo con tinte terracota muy sutil |

### Semánticos

| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#22C55E` | Items comprados, confirmaciones |
| `success-bg` | `#031a0d` | Fondo de estado comprado |
| `warning` | `#F59E0B` | Stock bajo en despensa |
| `error` | `#EF4444` | Errores, item agotado |

### Avatares de usuarios (mock)

| Usuario | Color | Hex |
|---------|-------|-----|
| Ana | Violeta | `#8B5CF6` |
| Pablo | Azul cielo | `#0EA5E9` |

> Patrón general: cada miembro del hogar tiene un color asignado automáticamente al unirse. Los colores se usan para avatares, indicadores "quién añadió este item", y actividad reciente.

---

## Tipografía

- **Headings:** System font (`-apple-system, 'SF Pro Display', 'Inter'`) — Weight 600-700
- **Body:** System font — Weight 400-500
- **Mono:** No aplica en v0.1

### Escala (mobile, px)

| Token | Size | Line Height | Weight | Uso |
|-------|------|-------------|--------|-----|
| `text-2xs` | 10px | 14px | 400 | Badges, timestamps |
| `text-xs` | 12px | 16px | 400 | Captions, categorías |
| `text-sm` | 13px | 18px | 400 | Metadatos, labels secundarios |
| `text-base` | 15px | 22px | 400 | Body, items de lista |
| `text-lg` | 17px | 24px | 600 | Títulos de sección, item destacado |
| `text-xl` | 20px | 28px | 700 | Títulos de pantalla |
| `text-2xl` | 24px | 32px | 700 | Títulos grandes |
| `text-3xl` | 28px | 36px | 700 | Hero, onboarding |

---

## Iconografía

- **Set:** Lucide Icons (en la app React Native real; en el prototipo, símbolos Unicode)
- **Estilo:** Outlined, 1.5px stroke
- **Tamaño:** 20px UI, 24px navegación, 16px inline
- **Color:** `currentColor` siempre

---

## Navegación (mobile patterns)

- **Bottom tab bar** — 4 tabs: Lista, Despensa, Recetas, Hogar
- **Large title header** — iOS style, título grande en la pantalla, se comprime al scroll
- **FAB** (Floating Action Button) — Para añadir items en Lista, Despensa y Recetas
- **Bottom sheets** — Para formularios de añadir item (no navegar a pantalla nueva)

---

## Espaciado y layout (mobile)

- **Padding lateral estándar:** 20px
- **Status bar (iPhone):** 59px (incluye Dynamic Island)
- **Tab bar:** 83px (incluye home indicator)
- **Cards:** padding interno 16px
- **Separación entre secciones:** 24px
- **Touch target mínimo:** 44x44px

---

## Bordes y formas

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Badges, tags |
| `radius-md` | 8px | Inputs |
| `radius-lg` | 12px | Cards, items de lista |
| `radius-xl` | 16px | Modals, bottom sheets |
| `radius-full` | 9999px | Avatares, pills |

---

## Referencia visual

- **Linear** — densidad de información, micro-interacciones
- **Bear app** — calidez en un entorno dark, tipografía clara
- **Notion mobile** — organización por secciones, navegación limpia
- **Bring! app** — categorías de lista de compra (solo la estructura, no el estilo visual)

**Diferenciadores visuales de Fogon:**
1. El terracota como acento cálido (vs el azul frío de apps de productividad)
2. Los avatares de colores siempre visibles (refuerza la naturaleza colaborativa)
3. Dark mode con negros OLED reales (vs grises oscuros genéricos)

---

## Pantallas clave y decisiones de UX

### Auth
- Logo prominente en la mitad superior. La app se presenta antes de pedir datos.
- Formulario en la mitad inferior en una card elevada.
- Google OAuth como primera opción visual (reduce fricción).

### Home
- Visible de un vistazo: quién está en el hogar, qué hay en la lista hoy, actividad reciente.
- No es un dashboard con gráficas. Es "tu resumen de la cocina para hoy".

### Lista de la compra
- Pantalla principal. Se abre por defecto.
- Real-time sync indicator siempre visible (punto verde parpadeante).
- Categorías colapsables para listas largas.
- Item comprado: strikethrough + opacity reducida + color success. No se elimina hasta limpiar.

### Despensa
- Vista de cuadrícula (2 columnas) para ver más items a la vez.
- Color coding por nivel de stock: verde/amarillo/rojo.
- "Marcar agotado" mueve el item a la lista automáticamente (el diferenciador de Fogon).

### Recetas
- Cards con imagen (placeholder terracota gradient para MVP).
- CTA directo "Añadir ingredientes a lista" visible sin entrar al detalle.

---

## Notas y restricciones

- App móvil únicamente. No hay versión web (salvo landing y receta pública compartida).
- i18n desde el día 1: EN + ES. Todos los strings van en archivos de traducción.
- Dark mode por defecto. Light mode a implementar post-MVP.
- Sin gradientes en backgrounds. Solo en placeholders de imágenes de recetas.
- Geist font en web (landing). System font en la app React Native.
