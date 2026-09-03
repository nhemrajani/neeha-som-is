import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const password = process.env.RESEARCH_LOG_PASSWORD;

  // Without a configured password the log would be world-readable, so fail closed.
  if (!password) {
    return new NextResponse(
      "RESEARCH_LOG_PASSWORD is not set. Add it in Vercel -> Settings -> Environment Variables.",
      { status: 500, headers: { "content-type": "text/plain" } },
    );
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  if (safeEqual(cookie, await sessionToken(password))) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};
