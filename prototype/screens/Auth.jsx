/**
 * Prototipo: Auth — Login / Registro
 * Producto: Fogon
 * Fecha: 2026-03-02
 *
 * Decisiones de diseño:
 * - Logo prominente en la mitad superior. La app se presenta antes de pedir credenciales.
 * - Google OAuth como primera opción visual (menor fricción).
 * - Fondo con tinte terracota muy sutil para calidez sin agresividad.
 * - Formulario en card elevada para separar visualmente las zonas.
 */

import { Logo, LogoWordmark } from '../Logo.jsx';
import { colors, typography, spacing, radius, system } from '../tokens.js';

const font = typography.family;

export default function Auth() {
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

      {/* Hero: logo + tagline */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${spacing[6]}px ${spacing[5]}px ${spacing[4]}px`,
          // Fondo con tinte terracota muy sutil
          background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${colors.terracotaFaint} 0%, ${colors.bgPrimary} 100%)`,
        }}
      >
        {/* Flame logo grande */}
        <div style={{ marginBottom: spacing[4] }}>
          <Logo size={72} color={colors.terracota} />
        </div>

        {/* Wordmark */}
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: colors.textPrimary,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: spacing[3],
          }}
        >
          fogon
        </span>

        {/* Tagline */}
        <p
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: '22px',
          }}
        >
          Tu cocina, organizada.
        </p>
      </div>

      {/* Formulario */}
      <div
        style={{
          background: colors.bgSecondary,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          borderTop: `1px solid ${colors.border}`,
          padding: `${spacing[6]}px ${spacing[5]}px`,
          paddingBottom: spacing[8],
          flexShrink: 0,
        }}
      >
        {/* Separador "o continúa con email" */}
        <p
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            textAlign: 'center',
            marginBottom: spacing[4],
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Inicia sesión o crea tu cuenta
        </p>

        {/* Email input */}
        <div style={{ marginBottom: spacing[3] }}>
          <div
            style={{
              background: colors.bgTertiary,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: `${spacing[3]}px ${spacing[4]}px`,
              fontSize: 15,
              color: colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <span style={{ fontSize: 16 }}>✉</span>
            <span>correo@ejemplo.com</span>
          </div>
        </div>

        {/* Contraseña input */}
        <div style={{ marginBottom: spacing[5] }}>
          <div
            style={{
              background: colors.bgTertiary,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: `${spacing[3]}px ${spacing[4]}px`,
              fontSize: 15,
              color: colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <span style={{ fontSize: 16 }}>🔒</span>
            <span>••••••••</span>
          </div>
        </div>

        {/* CTA principal */}
        <button
          style={{
            width: '100%',
            padding: `${spacing[4]}px`,
            background: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: radius.lg,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: spacing[3],
            fontFamily: font,
            letterSpacing: '-0.01em',
          }}
        >
          Continuar →
        </button>

        {/* Separador */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginBottom: spacing[3],
          }}
        >
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: 12, color: colors.textTertiary }}>o</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        {/* Google OAuth */}
        <button
          style={{
            width: '100%',
            padding: `${spacing[3]}px`,
            background: 'transparent',
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            fontFamily: font,
          }}
        >
          <span style={{ fontSize: 18 }}>G</span>
          Continuar con Google
        </button>

        {/* Pie */}
        <p
          style={{
            textAlign: 'center',
            marginTop: spacing[4],
            fontSize: 13,
            color: colors.textTertiary,
          }}
        >
          Al continuar aceptas los{' '}
          <span style={{ color: colors.primary }}>términos y condiciones</span>
        </p>
      </div>
    </div>
  );
}
