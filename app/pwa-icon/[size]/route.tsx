import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Google Fonts' css2 endpoint returns a TrueType src (which satori/next-og can
// rasterize) when the request comes from an unknown user agent, so we can pull
// Lato at request time and hand the raw font data to ImageResponse.
async function loadLato(text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Lato:wght@900&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (src) {
    const res = await fetch(src[1]);
    if (res.ok) return res.arrayBuffer();
  }
  throw new Error("failed to load Lato font");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = Number(sizeParam) || 512;
  const maskable = request.nextUrl.searchParams.has("maskable");
  const padding = maskable ? size * 0.2 : size * 0.12;
  const label = "OS";
  const latoData = await loadLato(label);

  const tile = size - padding * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0e12",
        }}
      >
        <div
          style={{
            position: "relative",
            width: tile,
            height: tile,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: size * 0.24,
            background:
              "linear-gradient(145deg, #14b39d 0%, #0b8577 52%, #075f55 100%)",
            border: `${Math.max(size * 0.008, 1)}px solid rgba(255,255,255,0.16)`,
            boxShadow: `0 ${size * 0.03}px ${size * 0.08}px rgba(0,0,0,0.35)`,
          }}
        >
          {/* Soft highlight sweep across the top for a glassy finish. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "55%",
              borderTopLeftRadius: size * 0.24,
              borderTopRightRadius: size * 0.24,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              color: "#f2f3f5",
              fontSize: size * 0.36,
              fontWeight: 900,
              fontFamily: "Lato",
            }}
          >
            {label}
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Lato", data: latoData, weight: 900, style: "normal" }],
    }
  );
}
