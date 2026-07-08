import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Shared look for each of the 4 grid cells — a mini tile echoing the
// LayoutGrid mark used on the login screen.
const cellStyle = {
  width: 13,
  height: 13,
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg, #14b39d 0%, #0b8577 52%, #075f55 100%)",
  color: "#ffffff",
  fontSize: 9,
  fontWeight: 800,
  fontFamily: "sans-serif",
} as const;

export default function Icon() {
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
          gap: 2,
          background: "#12141a",
        }}
      >
        <div style={{ display: "flex", gap: 2 }}>
          <div style={cellStyle}>S</div>
          <div style={cellStyle}>U</div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={cellStyle}>O</div>
          <div style={cellStyle}>S</div>
        </div>
      </div>
    ),
    size
  );
}
