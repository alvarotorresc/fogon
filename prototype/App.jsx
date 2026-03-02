/**
 * App — Navegador de pantallas del prototipo
 * Permite cambiar entre las distintas pantallas de Fogon.
 */

import { useState } from 'react';
import { PhoneFrame } from './PhoneFrame.jsx';
import Auth from './screens/Auth.jsx';
import Home from './screens/Home.jsx';
import ShoppingList from './screens/ShoppingList.jsx';
import Pantry from './screens/Pantry.jsx';
import Recipes from './screens/Recipes.jsx';
import { LogoWordmark } from './Logo.jsx';
import { colors } from './tokens.js';

const SCREENS = [
  { id: 'auth', label: 'Auth', component: Auth, description: 'Login / Registro' },
  { id: 'home', label: 'Hogar', component: Home, description: 'Dashboard del hogar' },
  { id: 'list', label: 'Lista', component: ShoppingList, description: 'Lista de la compra' },
  { id: 'pantry', label: 'Despensa', component: Pantry, description: 'Gestión de despensa' },
  { id: 'recipes', label: 'Recetas', component: Recipes, description: 'Recetario + detalle' },
];

const font = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

export default function App() {
  const [active, setActive] = useState('list');
  const Screen = SCREENS.find((s) => s.id === active).component;
  const activeScreen = SCREENS.find((s) => s.id === active);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px 48px',
        fontFamily: font,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 32,
          gap: 12,
        }}
      >
        <LogoWordmark size={28} color={colors.terracota} textColor={colors.textPrimary} />
        <p style={{ color: colors.textTertiary, fontSize: 13, margin: 0 }}>
          Prototipo visual — Fase 2a
        </p>
      </div>

      {/* Selector de pantallas */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 32,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 500,
        }}
      >
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            title={s.description}
            style={{
              padding: '7px 18px',
              borderRadius: 9999,
              border: '1px solid',
              borderColor: active === s.id ? colors.terracota : '#2E2E2E',
              background: active === s.id ? colors.terracotaFaint : 'transparent',
              color: active === s.id ? colors.terracota : '#A3A3A3',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active === s.id ? 600 : 400,
              transition: 'all 0.15s ease',
              fontFamily: font,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Pantalla activa en marco de móvil */}
      <PhoneFrame>
        <Screen />
      </PhoneFrame>

      {/* Descripción de la pantalla */}
      <p
        style={{
          marginTop: 20,
          color: '#525252',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        {activeScreen.label} — {activeScreen.description}
      </p>

      {/* Firma */}
      <p
        style={{
          marginTop: 40,
          color: '#2E2E2E',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        Made with 🔥 by{' '}
        <a href="https://alvarotc.com" style={{ color: '#525252', textDecoration: 'none' }}>
          Alvaro Torres
        </a>
      </p>
    </div>
  );
}
