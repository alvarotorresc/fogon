# Prototipos — Fogon

> Prototipo visual de la app de cocina colaborativa.
> **Esto es una visión, no código de producción.**

## Cómo ver los prototipos

```bash
cd prototype
pnpm install
pnpm dev
```

Abre `http://localhost:5173` y usa los botones para navegar entre pantallas.

## Pantallas

| Archivo | Pantalla | Estado |
|---------|----------|--------|
| `screens/Auth.jsx` | Login / Registro | ✅ Listo |
| `screens/Home.jsx` | Dashboard del hogar | ✅ Listo |
| `screens/ShoppingList.jsx` | Lista de la compra | ✅ Interactivo |
| `screens/Pantry.jsx` | Gestión de despensa | ✅ Interactivo |
| `screens/Recipes.jsx` | Recetario + detalle | ✅ Interactivo |

## Interactividad

- **Lista**: marcar items como comprados (checkbox), barra de progreso
- **Despensa**: marcar agotado, mover a lista de compra con un tap
- **Recetas**: filtros por tipo, ver detalle en bottom sheet, ver ingredientes disponibles en despensa

## Decisiones de diseño clave

- **Dark mode OLED** — negro puro (#0A0A0A). La app se usa en cocinas y súpers, a veces con poca luz.
- **Terracota (#EA580C)** como color temático — calor, fuego, hogar. No un azul genérico.
- **Avatares de colores** siempre visibles — refuerza la naturaleza colaborativa.
- **FAB terracota** — la acción principal destacada, siempre accesible con el pulgar.
- **Bottom sheet para detalles** — no navegar a nueva pantalla innecesariamente.

## Archivos de soporte

- `tokens.js` — Design tokens compartidos (colores, tipografía, espaciado)
- `Logo.jsx` — Logo SVG como componente React
- `PhoneFrame.jsx` — Marco de iPhone 14 para el prototipo web
