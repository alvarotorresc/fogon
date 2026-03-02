/**
 * Prototipo: Recipes — Recetario
 * Producto: Fogon
 * Fecha: 2026-03-02
 *
 * Decisiones de diseño:
 * - Cards con imagen placeholder (gradiente terracota, no Lorem Ipsum visual).
 * - CTA "Añadir ingredientes a lista" visible en la card sin entrar al detalle.
 * - Chips de filtro para navegación rápida (Todas / Rápidas / Vegetarianas).
 * - Al tocar una receta se muestra el detalle en un bottom sheet simulado.
 * - El detail view muestra ingredientes + "descontar de despensa" (el flujo diferenciador).
 */

import { useState } from 'react';
import { colors, typography, spacing, radius, system } from '../tokens.js';

const font = typography.family;

const recipes = [
  {
    id: 1,
    name: 'Pasta al pesto',
    time: '25 min',
    servings: 2,
    tags: ['Rápidas', 'Vegetarianas'],
    by: 'Pablo',
    byColor: colors.pablo,
    gradient: [`${colors.terracota}`, '#7C2D12'],
    ingredients: [
      { name: 'Espagueti', qty: '200 g', inPantry: true },
      { name: 'Albahaca fresca', qty: '1 manojo', inPantry: false },
      { name: 'Aceite de oliva', qty: '4 cdas', inPantry: true },
      { name: 'Ajo', qty: '2 dientes', inPantry: true },
      { name: 'Queso parmesano', qty: '50 g', inPantry: false },
      { name: 'Piñones', qty: '30 g', inPantry: false },
    ],
    steps: ['Cocer la pasta.', 'Triturar albahaca, ajo, aceite y piñones.', 'Mezclar con la pasta escurrida.', 'Añadir queso rallado.'],
  },
  {
    id: 2,
    name: 'Tortilla española',
    time: '35 min',
    servings: 4,
    tags: ['Vegetarianas'],
    by: 'Ana',
    byColor: colors.ana,
    gradient: ['#7C3AED', '#4C1D95'],
    ingredients: [
      { name: 'Patatas', qty: '4 medianas', inPantry: false },
      { name: 'Huevos', qty: '6 ud', inPantry: false },
      { name: 'Cebolla', qty: '1 ud', inPantry: false },
      { name: 'Aceite de oliva', qty: 'abundante', inPantry: true },
      { name: 'Sal', qty: 'al gusto', inPantry: true },
    ],
    steps: ['Pelar y laminar las patatas.', 'Pochar con cebolla en aceite.', 'Batir huevos y mezclar.', 'Cuajar a fuego lento.', 'Dar la vuelta y terminar.'],
  },
  {
    id: 3,
    name: 'Pollo al limón',
    time: '45 min',
    servings: 2,
    tags: ['Rápidas'],
    by: 'Ana',
    byColor: colors.ana,
    gradient: ['#0369A1', '#0C4A6E'],
    ingredients: [
      { name: 'Pechuga de pollo', qty: '400 g', inPantry: false },
      { name: 'Limón', qty: '2 ud', inPantry: false },
      { name: 'Ajo', qty: '3 dientes', inPantry: true },
      { name: 'Romero', qty: '2 ramas', inPantry: false },
      { name: 'Aceite de oliva', qty: '3 cdas', inPantry: true },
    ],
    steps: ['Marinar el pollo con limón, ajo y romero.', 'Sellar en sartén con aceite.', 'Hornear 20 min a 180°C.'],
  },
  {
    id: 4,
    name: 'Ensalada mediterránea',
    time: '10 min',
    servings: 2,
    tags: ['Rápidas', 'Vegetarianas'],
    by: 'Pablo',
    byColor: colors.pablo,
    gradient: ['#059669', '#064E3B'],
    ingredients: [
      { name: 'Lechuga', qty: '1 ud', inPantry: false },
      { name: 'Tomate', qty: '2 ud', inPantry: false },
      { name: 'Pepino', qty: '1 ud', inPantry: false },
      { name: 'Aceitunas', qty: '50 g', inPantry: false },
      { name: 'Queso feta', qty: '80 g', inPantry: false },
      { name: 'Aceite de oliva', qty: '3 cdas', inPantry: true },
    ],
    steps: ['Lavar y trocear las verduras.', 'Mezclar con aceitunas y queso.', 'Aliñar con aceite y sal.'],
  },
];

const FILTERS = ['Todas', 'Rápidas', 'Vegetarianas'];

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

function RecipeCard({ recipe, onOpen, onAddToList, added }) {
  return (
    <div
      style={{
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        overflow: 'hidden',
        marginBottom: spacing[3],
      }}
    >
      {/* Imagen placeholder — gradiente temático */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: `0 ${spacing[4]}px ${spacing[3]}px`,
          cursor: 'pointer',
        }}
        onClick={() => onOpen(recipe)}
      >
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: '22px' }}>
            {recipe.name}
          </h3>
          <div style={{ display: 'flex', gap: spacing[3], marginTop: 3 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>⏱ {recipe.time}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>👤 {recipe.servings}</span>
          </div>
        </div>
      </div>

      {/* Footer de la card */}
      <div
        style={{
          padding: `${spacing[3]}px ${spacing[4]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Autor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: radius.full,
              background: recipe.byColor + '22',
              border: `1.5px solid ${recipe.byColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: recipe.byColor,
            }}
          >
            {recipe.by[0]}
          </div>
          <span style={{ fontSize: 12, color: colors.textSecondary }}>por {recipe.by}</span>
        </div>

        {/* CTA "Añadir a lista" */}
        <button
          onClick={() => onAddToList(recipe.id)}
          style={{
            background: added ? colors.successBg : colors.terracotaFaint,
            border: `1px solid ${added ? colors.success : colors.terracota + '44'}`,
            borderRadius: radius.full,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: added ? colors.success : colors.terracota,
            cursor: 'pointer',
            fontFamily: font,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {added ? '✓ Añadido' : '+ Añadir a lista'}
        </button>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, onClose }) {
  const missing = recipe.ingredients.filter((i) => !i.inPantry);
  const inPantry = recipe.ingredients.filter((i) => i.inPantry);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.bgSecondary,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '85%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing[3]}px` }}>
          <div style={{ width: 36, height: 4, background: colors.border, borderRadius: radius.full }} />
        </div>

        {/* Header */}
        <div
          style={{
            height: 100,
            background: `linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})`,
            display: 'flex',
            alignItems: 'flex-end',
            padding: `0 ${spacing[5]}px ${spacing[3]}px`,
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{recipe.name}</h2>
            <div style={{ display: 'flex', gap: spacing[4], marginTop: 4 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>⏱ {recipe.time}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>👤 {recipe.servings} personas</span>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ overflowY: 'auto', padding: `${spacing[4]}px ${spacing[5]}px ${spacing[6]}px` }}>

          {/* Ingredientes */}
          <p style={{ fontSize: 11, fontWeight: 600, color: colors.textTertiary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: spacing[3] }}>
            Ingredientes
          </p>

          {/* Lo que falta */}
          {missing.length > 0 && (
            <div style={{ marginBottom: spacing[3] }}>
              <p style={{ fontSize: 12, color: colors.terracota, marginBottom: spacing[2], fontWeight: 500 }}>
                Necesitas comprar ({missing.length})
              </p>
              {missing.map((ing) => (
                <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', padding: `6px 0`, borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  <span style={{ fontSize: 14, color: colors.textPrimary }}>{ing.name}</span>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>{ing.qty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lo que ya tienes */}
          {inPantry.length > 0 && (
            <div style={{ marginBottom: spacing[4] }}>
              <p style={{ fontSize: 12, color: colors.success, marginBottom: spacing[2], fontWeight: 500 }}>
                Ya tienes en casa ({inPantry.length})
              </p>
              {inPantry.map((ing) => (
                <div key={ing.name} style={{ display: 'flex', justifyContent: 'space-between', padding: `6px 0`, borderBottom: `1px solid ${colors.borderSubtle}`, opacity: 0.6 }}>
                  <span style={{ fontSize: 14, color: colors.textPrimary, textDecoration: 'line-through' }}>{ing.name}</span>
                  <span style={{ fontSize: 13, color: colors.textSecondary }}>{ing.qty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pasos */}
          <p style={{ fontSize: 11, fontWeight: 600, color: colors.textTertiary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: spacing[3], marginTop: spacing[2] }}>
            Preparación
          </p>
          {recipe.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[3] }}>
              <div style={{ width: 24, height: 24, borderRadius: radius.full, background: colors.terracotaFaint, border: `1px solid ${colors.terracota}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: colors.terracota, flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: '20px', paddingTop: 3 }}>{step}</p>
            </div>
          ))}

          {/* CTA principal */}
          <button
            style={{
              width: '100%',
              padding: spacing[4],
              background: colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: radius.lg,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: font,
              marginTop: spacing[2],
            }}
          >
            Añadir {missing.length} item{missing.length !== 1 ? 's' : ''} a la lista →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recipes() {
  const [filter, setFilter] = useState('Todas');
  const [selected, setSelected] = useState(null);
  const [added, setAdded] = useState([]);

  const filtered = filter === 'Todas' ? recipes : recipes.filter((r) => r.tags.includes(filter));

  return (
    <div
      style={{
        fontFamily: font,
        background: colors.bgPrimary,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Status bar */}
      <div style={{ height: system.statusBarHeight, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: `${spacing[2]}px ${spacing[5]}px 0`, flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em', marginBottom: spacing[4] }}>
          Recetas
        </h1>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: spacing[2], paddingBottom: spacing[3], overflowX: 'auto' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: radius.full,
                border: `1px solid ${filter === f ? colors.terracota : colors.border}`,
                background: filter === f ? colors.terracotaFaint : 'transparent',
                color: filter === f ? colors.terracota : colors.textSecondary,
                fontSize: 13,
                fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer',
                fontFamily: font,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: colors.borderSubtle, flexShrink: 0 }} />

      {/* Lista scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing[4]}px ${spacing[5]}px 80px` }}>
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onOpen={setSelected}
            onAddToList={(id) => setAdded((prev) => [...prev, id])}
            added={added.includes(recipe.id)}
          />
        ))}
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

      {/* Tab bar */}
      <TabBar active="recipes" />

      {/* Bottom sheet: detalle de receta */}
      {selected && (
        <RecipeDetail recipe={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
