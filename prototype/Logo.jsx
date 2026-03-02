/**
 * Logo — Fogon
 * Llama SVG minimalista. Representa el "fogón" (fuego del hogar).
 * Funciona en claro, oscuro y monocromo.
 * Reconocible desde 16x16px.
 */

export function Logo({ size = 32, color = '#EA580C', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fogon logo"
    >
      {/* Llama exterior — silueta principal */}
      <path
        d="M16 29C11 29 6 24 7 17C8 10 12 4 16 3C20 4 24 10 25 17C26 24 21 29 16 29Z"
        fill={color}
      />
      {/* Centro de la llama — halo interior (profundidad) */}
      <path
        d="M16 24C13.5 24 12 21.5 12.5 18.5C13 15.5 14.5 13 16 13C17.5 13 19 15.5 19.5 18.5C20 21.5 18.5 24 16 24Z"
        fill="white"
        opacity="0.22"
      />
    </svg>
  );
}

/**
 * LogoWordmark — logo + nombre "fogon"
 */
export function LogoWordmark({
  size = 32,
  color = '#EA580C',
  textColor = '#EDEDED',
  className = '',
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}
      className={className}
    >
      <Logo size={size} color={color} />
      <span
        style={{
          fontSize: Math.round(size * 0.72),
          fontWeight: 700,
          color: textColor,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        fogon
      </span>
    </div>
  );
}

export default Logo;
