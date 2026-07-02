import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OS — Ledger",
    short_name: "OS",
    description: "Track every rupee that moves — expenses, income, and transfers.",
    start_url: "/",
    display: "standalone",
    background_color: "#12141a",
    theme_color: "#12141a",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa-icon/512?maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
