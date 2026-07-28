import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  coach: "/panel-coach",
  client: "/panel-cliente",
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path === "/login" ||
    path.startsWith("/coach/registro") ||
    path.startsWith("/pendiente-aprobacion") ||
    path.startsWith("/invitacion") ||
    path.startsWith("/_next") ||
    path.startsWith("/api");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Si un usuario autenticado visita login o la raíz, mándalo a su panel.
    if (role && (path === "/login")) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/";
      return NextResponse.redirect(url);
    }

    // Aislamiento de secciones por rol a nivel de rutas (además del RLS en BD).
    const guardedPrefix = ["/admin", "/panel-coach", "/panel-cliente"].find((p) =>
      path.startsWith(p)
    );
    if (guardedPrefix && role) {
      const expected = Object.entries(ROLE_HOME).find(([, home]) => home === guardedPrefix)?.[0];
      if (expected && expected !== role) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_HOME[role] ?? "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
