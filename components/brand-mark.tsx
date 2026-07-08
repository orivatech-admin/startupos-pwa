// Mirrors the grid mark rendered server-side for the favicon (app/icon.tsx),
// apple touch icon, and PWA icon (app/pwa-icon/[size]/route.tsx) — same
// ratios, kept in sync by hand since those run through next/og's ImageResponse
// and can't share this component directly.
const CELL_RATIO = 13 / 32;
const GAP_RATIO = 2 / 32;
const CELL_RADIUS_RATIO = 3 / 13;
const FONT_RATIO = 9 / 13;
const CONTAINER_RADIUS_RATIO = 0.22;

export function BrandMark({ size = 64, className }: { size?: number; className?: string }) {
  const cell = size * CELL_RATIO;
  const gap = size * GAP_RATIO;

  const cellStyle: React.CSSProperties = {
    width: cell,
    height: cell,
    borderRadius: cell * CELL_RADIUS_RATIO,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #14b39d 0%, #0b8577 52%, #075f55 100%)",
    color: "#ffffff",
    fontSize: cell * FONT_RATIO,
    fontWeight: 800,
  };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * CONTAINER_RADIUS_RATIO,
        background: "#12141a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
      }}
    >
      <div style={{ display: "flex", gap }}>
        <div style={cellStyle}>S</div>
        <div style={cellStyle}>U</div>
      </div>
      <div style={{ display: "flex", gap }}>
        <div style={cellStyle}>O</div>
        <div style={cellStyle}>S</div>
      </div>
    </div>
  );
}
