import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

function getRedirectOrigin(request: NextRequest, fallbackOrigin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (process.env.NODE_ENV === "development" || !forwardedHost) {
    return fallbackOrigin;
  }

  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/home";
  const redirectOrigin = getRedirectOrigin(request, origin);

  if (!next.startsWith("/")) {
    next = "/home";
  }

  if (!code) {
    return NextResponse.redirect(
      `${redirectOrigin}/auth/auth-code-error?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  const supabaseResponse = NextResponse.redirect(`${redirectOrigin}${next}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${redirectOrigin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
    );
  }

  return supabaseResponse;
}
