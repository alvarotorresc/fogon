/**
 * Prototipo: Pantry — Despensa
 * Producto: Fogon
 * Fecha: 2026-03-02
 *
 * Decisiones de diseño:
 * - Grid de 2 columnas para ver más items a la vez (la despensa puede ser larga).
 * - Color coding por nivel de stock: verde=ok, amarillo=poco, rojo=agotado.
 * - "Marcar agotado" es EL diferenciador de Fogon: mueve el item a la lista automáticamente.
 * - Items agotados aparecen con borde terracota y prompt de "mover a lista".
 * - Header con conteo de items con stock bajo para urgencia visual.
 */

import { useState } from 'react';
import { colors, typography, spacing, radius, system } from '../tokens.js';

const font = typography.family;

const LEVELS = {
  ok: { label: 'OK', color: colors.success, bg: colors.successBg, border: colors.successBorder },
  low: { label: 'POCO', color: colors.warning, bg: colors.warningBg, border: '#713f12' },
  out: { label: 'AGOTADO', color: colors.error, bg: '#1c0505', border: '#7f1d1d' },
};

const initialItems = [
  { id: 1, emoji: '🥛', name: 'Leche', detail: '~200 mL', level: 'low' },
  { id: 2, emoji: '🧀', name: 'Queso', detail: '1 bloque', level: 'ok' },
  { id: 3, emoji: '🍚', name: 'Arroz', detail: '~300 g', level: 'ok' },
  { id: 4, emoji: '🫙', name: 'Garbanzos', detail: '1 bote', level: 'ok' },
  { id: 5, emoji: '🥚', name: 'Huevos', detail: '0 ud', level: 'out' },
  { id: 6, emoji: '🧂', name: 'Sal', detail: 'abundante', level: 'ok' },
  { id: 7, emoji: '🫒', name: 'Aceite', detail: '~100 mL', level: 'low' },
  { id: 8, emoji: '🌿', name: 'Orégano', detail: 'casi vacío', level: 'low' },
  { id: 9, emoji: '🍅', name: 'Tomate triturado', detail: '2 botes', level: 'ok' },
  { id: 10, emoji: '🧄', name: 'Ajo', detail: '3 dientes', level: 'ok' },
];

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

export default function Pantry() {
  const [items, setItems] = useState(initialItems);
  const [movedToList, setMovedToList] = useState([]);

  const markOut = (id) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, level: 'out' } : item));
  };

  const moveToList = (id) => {
    setMovedToList((prev) => [...prev, id]);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const lowCount = items.filter((i) => i.level === 'low' || i.level === 'out').length;

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
          padding: `${spacing[2]}px ${spacing[5]}px ${spacing[4]}px`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em' }}>
              Despensa
            </h1>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {items.length} items
              {lowCount > 0 && (
                <span style={{ color: colors.warning, marginLeft: 6 }}>
                  · {lowCount} con poco stock
                </span>
              )}
            </p>
          </div>
          {/* Contador de bajo stock */}
          {lowCount > 0 && (
            <div
              style={{
                background: colors.warningBg,
                border: `1px solid ${colors.warning}55`,
                borderRadius: radius.full,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ fontSize: 12, color: colors.warning, fontWeight: 600 }}>{lowCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: colors.borderSubtle, flexShrink: 0 }} />

      {/* Toast si se movió algo a lista */}
      {movedToList.length > 0 && (
        <div
          style={{
            margin: `${spacing[3]}px ${spacing[5]}px 0`,
            background: colors.successBg,
            border: `1px solid ${colors.successBorder}`,
            borderRadius: radius.lg,
            padding: `${spacing[2]}px ${spacing[3]}px`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>✓</span>
          <span style={{ fontSize: 13, color: colors.success }}>
            Añadido a la lista de compra
          </span>
        </div>
      )}

      {/* Grid scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${spacing[4]}px ${spacing[5]}px`,
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing[3],
          }}
        >
          {items.map((item) => {
            const lvl = LEVELS[item.level];
            const isOut = item.level === 'out';

            return (
              <div
                key={item.id}
                style={{
                  background: isOut ? lvl.bg : colors.bgSecondary,
                  border: `1px solid ${isOut ? lvl.border : colors.border}`,
                  borderRadius: radius.xl,
                  padding: `${spacing[4]}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[2],
                  cursor: 'default',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Emoji + badge de nivel */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div
                    style={{
                      background: lvl.bg,
                      border: `1px solid ${lvl.border}`,
                      borderRadius: radius.full,
                      padding: '2px 7px',
                    }}
                  >
                    <span style={{ fontSize: 10, color: lvl.color, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {lvl.label}
                    </span>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, lineHeight: '18px' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 12, color: colors.textSecondary }}>
                    {item.detail}
                  </p>
                </div>

                {/* Acción según nivel */}
                {isOut ? (
                  <button
                    onClick={() => moveToList(item.id)}
                    style={{
                      background: colors.terracota,
                      border: 'none',
                      borderRadius: radius.md,
                      padding: `${spacing[2]}px`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: font,
                      marginTop: 2,
                    }}
                  >
                    + Añadir a lista
                  </button>
                ) : (
                  <button
                    onClick={() => markOut(item.id)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius.md,
                      padding: `${spacing[2]}px`,
                      fontSize: 12,
                      color: colors.textTertiary,
                      cursor: 'pointer',
                      fontFamily: font,
                      marginTop: 2,
                    }}
                  >
                    Marcar agotado
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
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

      <TabBar active="pantry" />
    </div>
  );
}
