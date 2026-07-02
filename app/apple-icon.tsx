import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12141a",
          color: "#e8a153",
          fontSize: 76,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        OS
      </div>
    ),
    size
  );
}
