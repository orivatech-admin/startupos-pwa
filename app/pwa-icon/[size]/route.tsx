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
  const latoData = await loadLato("SUO");

  const tile = size - padding * 2;
  const gap = tile * 0.06;
  const cell = (tile - gap) / 2;

  const cellStyle = {
    width: cell,
    height: cell,
    borderRadius: cell * 0.22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(145deg, #14b39d 0%, #0b8577 52%, #075f55 100%)",
    color: "#f2f3f5",
    fontSize: cell * 0.5,
    fontWeight: 900,
    fontFamily: "Lato",
  } as const;

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
            display: "flex",
            flexDirection: "column",
            gap,
            width: tile,
            height: tile,
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
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Lato", data: latoData, weight: 900, style: "normal" }],
    }
  );
}
