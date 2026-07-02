import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = Number(sizeParam) || 512;
  const maskable = request.nextUrl.searchParams.has("maskable");
  const padding = maskable ? size * 0.2 : size * 0.12;

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
        }}
      >
        <div
          style={{
            width: size - padding * 2,
            height: size - padding * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: size * 0.22,
            background: "#e8a153",
            color: "#12141a",
            fontSize: size * 0.34,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          OS
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
