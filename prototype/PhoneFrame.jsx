/**
 * PhoneFrame — Simulación de iPhone 14 Pro (390x844)
 * Envuelve las pantallas del prototipo en un marco de móvil realista.
 */
export function PhoneFrame({ children }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        borderRadius: 54,
        overflow: 'hidden',
        position: 'relative',
        // Marco del teléfono
        outline: '10px solid #1C1C1E',
        outlineOffset: '0px',
        boxShadow:
          '0 0 0 2px #3A3A3C, 0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04) inset',
        flexShrink: 0,
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: 'absolute',
          top: 13,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 126,
          height: 34,
          background: '#000',
          borderRadius: 20,
          zIndex: 200,
        }}
      />
      {/* Contenido de la pantalla */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0A0A0A',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
