import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Mirrors the grid mark used in app/icon.tsx, scaled up for the iOS
// home-screen icon.
const cellStyle = {
  width: 73,
  height: 73,
  borderRadius: 17,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg, #14b39d 0%, #0b8577 52%, #075f55 100%)",
  color: "#ffffff",
  fontSize: 50,
  fontWeight: 800,
  fontFamily: "sans-serif",
} as const;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 11,
          background: "#12141a",
        }}
      >
        <div style={{ display: "flex", gap: 11 }}>
          <div style={cellStyle}>S</div>
          <div style={cellStyle}>U</div>
        </div>
        <div style={{ display: "flex", gap: 11 }}>
          <div style={cellStyle}>O</div>
          <div style={cellStyle}>S</div>
        </div>
      </div>
    ),
    size
  );
}
