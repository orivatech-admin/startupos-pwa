import { updateSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, manifest.webmanifest, sw.js (PWA assets)
     * - icon, apple-icon, pwa-icon (generated PWA/app icons)
     * - image file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon|apple-icon|pwa-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
