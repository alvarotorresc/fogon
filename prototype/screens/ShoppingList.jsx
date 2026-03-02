/**
 * Prototipo: ShoppingList — Lista de la compra
 * Producto: Fogon
 * Fecha: 2026-03-02
 *
 * Decisiones de diseño:
 * - Pantalla principal de la app. Se abre por defecto al entrar.
 * - Indicador de sync en tiempo real siempre visible (punto verde).
 * - Items agrupados por categoría para encontrarlos más rápido en el súper.
 * - Item comprado: strikethrough + opacity + success color. No se elimina hasta limpiar.
 * - Avatar de color del usuario que añadió el item. Refuerza la colaboración.
 * - FAB terracota en la esquina inferior derecha: acción principal.
 * - Progress bar para sentido de avance ("voy por la mitad").
 */

import { useState } from 'react';
import { colors, typography, spacing, radius, system } from '../tokens.js';

const font = typography.family;

// Categorías y items de mock
const initialItems = [
  // FRESCOS
  { id: 1, name: 'Manzanas', qty: '1 kg', category: 'Frescos', done: false, user: 'A', userColor: colors.ana },
  { id: 2, name: 'Tomates cherry', qty: '500 g', category: 'Frescos', done: true, user: 'P', userColor: colors.pablo },
  { id: 3, name: 'Lechuga', qty: '1 ud', category: 'Frescos', done: false, user: 'A', userColor: colors.ana },
  // LÁCTEOS
  { id: 4, name: 'Leche entera', qty: '2 L', category: 'Lácteos', done: false, user: 'A', userColor: colors.ana },
  { id: 5, name: 'Yogur natural', qty: 'x6', category: 'Lácteos', done: false, user: 'P', userColor: colors.pablo },
  // DESPENSA
  { id: 6, name: 'Pasta espagueti', qty: '500 g', category: 'Despensa', done: false, user: 'P', userColor: colors.pablo },
  { id: 7, name: 'Aceite de oliva', qty: '1 L', category: 'Despensa', done: true, user: 'A', userColor: colors.ana },
  // CARNES Y PESCADOS
  { id: 8, name: 'Pechugas de pollo', qty: '500 g', category: 'Carnes', done: false, user: 'A', userColor: colors.ana },
];

const CATEGORY_ORDER = ['Frescos', 'Lácteos', 'Carnes', 'Despensa'];

function TabBar({ active }) {
  const tabs = [
    { id: 'list', icon: '🛒', label: 'Lista' },
    { id: 'pantry', icon: '📦', label: 'Despensa' },
    { id: 'recipes', icon: '🍳', label: 'Recetas' },
    { id: 'home', icon: '🏠', label: 'Hogar' },
  ];
  return (
    <div style={{ height: system.tabBarHeight, background: colors.bgSecondary, borderTop: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', paddingTop: 10, flexShrink: 0 }}>
      {tabs.map((tab) => (
        <div key={tab.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, color: active === tab.id ? colors.terracota : colors.textTertiary, fontWeight: active === tab.id ? 600 : 400, fontFamily: font }}>
            {tab.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ShoppingList() {
  const [items, setItems] = useState(initialItems);

  const toggle = (id) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const doneCount = items.filter((i) => i.done).length;
  const total = items.length;
  const progress = doneCount / total;

  // Agrupar por categoría
  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div
      style={{
        fontFamily: font,
        background: colors.bgPrimary,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Status bar */}
      <div style={{ height: system.statusBarHeight, flexShrink: 0 }} />

      {/* Header */}
      <div
        style={{
          padding: `${spacing[2]}px ${spacing[5]}px ${spacing[3]}px`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em' }}>
            Lista de compra
          </h1>
          {/* Indicador real-time sync */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: radius.full,
              padding: '3px 10px',
            }}
          >
            {/* Punto parpadeante (visual, no anima en el prototipo) */}
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: radius.full,
                background: colors.success,
              }}
            />
            <span style={{ fontSize: 11, color: colors.success, fontWeight: 600 }}>Sync</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div
            style={{
              flex: 1,
              height: 4,
              background: colors.bgTertiary,
              borderRadius: radius.full,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: colors.success,
                borderRadius: radius.full,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: colors.textSecondary, flexShrink: 0 }}>
            {doneCount}/{total}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: colors.borderSubtle, flexShrink: 0 }} />

      {/* Lista scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <div key={category}>
            {/* Cabecera de categoría */}
            <div
              style={{
                padding: `${spacing[4]}px ${spacing[5]}px ${spacing[2]}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.textTertiary,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </span>
              <span style={{ fontSize: 11, color: colors.textTertiary }}>
                {catItems.filter((i) => i.done).length}/{catItems.length}
              </span>
            </div>

            {/* Items */}
            {catItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[3]}px ${spacing[5]}px`,
                  borderBottom: idx < catItems.length - 1 ? `1px solid ${colors.borderSubtle}` : 'none',
                  cursor: 'pointer',
                  opacity: item.done ? 0.45 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: radius.full,
                    border: `2px solid ${item.done ? colors.success : colors.border}`,
                    background: item.done ? colors.success : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.done && (
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>✓</span>
                  )}
                </div>

                {/* Nombre y cantidad */}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 15,
                      color: colors.textPrimary,
                      fontWeight: 500,
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}
                  >
                    {item.name}
                  </span>
                  <span style={{ fontSize: 13, color: colors.textTertiary, marginLeft: spacing[2] }}>
                    {item.qty}
                  </span>
                </div>

                {/* Avatar de quien lo añadió */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: radius.full,
                    background: item.userColor + '22',
                    border: `1.5px solid ${item.userColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: item.userColor,
                    flexShrink: 0,
                  }}
                >
                  {item.user}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Sección de comprados (si hay alguno) */}
        {doneCount > 0 && (
          <div style={{ padding: `${spacing[4]}px ${spacing[5]}px` }}>
            <button
              style={{
                fontSize: 13,
                color: colors.textTertiary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: font,
              }}
            >
              Limpiar {doneCount} comprado{doneCount !== 1 ? 's' : ''} →
            </button>
          </div>
        )}

        {/* Espaciado para el FAB */}
        <div style={{ height: 80 }} />
      </div>

      {/* FAB — Añadir item */}
      <div
        style={{
          position: 'absolute',
          bottom: system.tabBarHeight + spacing[4],
          right: spacing[5],
          width: 52,
          height: 52,
          borderRadius: radius.full,
          background: colors.terracota,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 300,
          color: '#fff',
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${colors.terracota}66`,
        }}
      >
        +
      </div>

      {/* Tab bar */}
      <TabBar active="list" />
    </div>
  );
}
