/**
 * Prototipo: Home — Dashboard del hogar
 * Producto: Fogon
 * Fecha: 2026-03-02
 *
 * Decisiones de diseño:
 * - No es un dashboard con gráficas. Es "tu resumen de la cocina para hoy".
 * - Los avatares de Ana y Pablo siempre visibles: refuerza la naturaleza colaborativa.
 * - Actividad reciente como timeline: muestra que la app funciona en tiempo real.
 * - Quick actions para las 3 acciones más frecuentes.
 */

import { colors, typography, spacing, radius, system } from '../tokens.js';

const font = typography.family;

// Mock data: el hogar de Ana y Pablo
const household = {
  name: 'Hogar Fernández',
  members: [
    { name: 'Ana', initial: 'A', color: colors.ana },
    { name: 'Pablo', initial: 'P', color: colors.pablo },
  ],
  stats: {
    listItems: 5,
    pantryItems: 12,
    recipes: 8,
  },
};

const activity = [
  { user: 'Ana', color: colors.ana, action: 'marcó Leche como comprada', time: 'hace 5 min', icon: '✓' },
  { user: 'Pablo', color: colors.pablo, action: 'añadió Pasta 500g a la lista', time: 'hace 20 min', icon: '+' },
  { user: 'Ana', color: colors.ana, action: 'marcó Tomates como agotados', time: 'hace 1h', icon: '📦' },
  { user: 'Pablo', color: colors.pablo, action: 'creó la receta "Pasta al pesto"', time: 'ayer', icon: '🍽' },
];

function Avatar({ name, initial, color, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius.full,
        background: color + '33', // 20% opacity
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 700,
        color: color,
        fontFamily: font,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function TabBar({ active }) {
  const tabs = [
    { id: 'list', icon: '🛒', label: 'Lista' },
    { id: 'pantry', icon: '📦', label: 'Despensa' },
    { id: 'recipes', icon: '🍳', label: 'Recetas' },
    { id: 'home', icon: '🏠', label: 'Hogar' },
  ];
  return (
    <div
      style={{
        height: system.tabBarHeight,
        background: colors.bgSecondary,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 10,
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          <span
            style={{
              fontSize: 10,
              color: active === tab.id ? colors.terracota : colors.textTertiary,
              fontWeight: active === tab.id ? 600 : 400,
              fontFamily: font,
            }}
          >
            {tab.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
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
      {/* Status bar spacer */}
      <div style={{ height: system.statusBarHeight, flexShrink: 0 }} />

      {/* Header */}
      <div
        style={{
          padding: `${spacing[2]}px ${spacing[5]}px ${spacing[4]}px`,
          borderBottom: `1px solid ${colors.borderSubtle}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 2 }}>
              Buenos días ☀️
            </p>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {household.name}
            </h1>
          </div>
          {/* Avatares del hogar */}
          <div style={{ display: 'flex', gap: -8 }}>
            {household.members.map((m, i) => (
              <div key={m.name} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: household.members.length - i }}>
                <Avatar {...m} size={38} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${spacing[5]}px` }}>

        {/* Stats cards */}
        <div style={{ paddingTop: spacing[5], paddingBottom: spacing[4] }}>
          <div style={{ display: 'flex', gap: spacing[3] }}>

            {/* Lista card — destacada, terracota accent */}
            <div
              style={{
                flex: 1,
                background: colors.terracotaFaint,
                border: `1px solid ${colors.terracota}33`,
                borderRadius: radius.xl,
                padding: `${spacing[4]}px`,
              }}
            >
              <p style={{ fontSize: 11, color: colors.terracota, fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>
                EN LA LISTA
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, lineHeight: 1 }}>
                {household.stats.listItems}
              </p>
              <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>items pendientes</p>
            </div>

            {/* Columna derecha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], flex: 1 }}>
              {/* Despensa */}
              <div
                style={{
                  flex: 1,
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.lg,
                  padding: `${spacing[3]}px`,
                }}
              >
                <p style={{ fontSize: 11, color: colors.textTertiary, fontWeight: 600, marginBottom: 2 }}>DESPENSA</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
                  {household.stats.pantryItems}
                  <span style={{ fontSize: 11, color: colors.textTertiary, fontWeight: 400, marginLeft: 3 }}>items</span>
                </p>
              </div>
              {/* Recetas */}
              <div
                style={{
                  flex: 1,
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.lg,
                  padding: `${spacing[3]}px`,
                }}
              >
                <p style={{ fontSize: 11, color: colors.textTertiary, fontWeight: 600, marginBottom: 2 }}>RECETAS</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
                  {household.stats.recipes}
                  <span style={{ fontSize: 11, color: colors.textTertiary, fontWeight: 400, marginLeft: 3 }}>guardadas</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ paddingBottom: spacing[5] }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.textTertiary,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: spacing[3],
            }}
          >
            Actividad reciente
          </p>

          <div
            style={{
              background: colors.bgSecondary,
              borderRadius: radius.xl,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}
          >
            {activity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[3]}px ${spacing[4]}px`,
                  borderBottom: i < activity.length - 1 ? `1px solid ${colors.borderSubtle}` : 'none',
                }}
              >
                {/* Avatar pequeño */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.full,
                    background: item.color + '22',
                    border: `1.5px solid ${item.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.user[0]}
                </div>

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.textPrimary,
                      lineHeight: '18px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span style={{ color: item.color, fontWeight: 600 }}>{item.user}</span>
                    {' '}{item.action}
                  </p>
                </div>

                {/* Tiempo */}
                <span style={{ fontSize: 11, color: colors.textTertiary, flexShrink: 0 }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invitar miembro */}
        <div
          style={{
            background: colors.bgSecondary,
            border: `1px dashed ${colors.border}`,
            borderRadius: radius.xl,
            padding: `${spacing[4]}px`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginBottom: spacing[5],
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.full,
              background: colors.bgTertiary,
              border: `2px dashed ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            +
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
              Invitar a alguien
            </p>
            <p style={{ fontSize: 12, color: colors.textTertiary }}>
              Comparte el hogar con tu pareja o familia
            </p>
          </div>
        </div>

      </div>

      {/* Tab bar */}
      <TabBar active="home" />
    </div>
  );
}
