import { NextResponse } from "next/server";
import { SESSION_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  const expected = process.env.RESEARCH_LOG_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "The log is not configured yet. RESEARCH_LOG_PASSWORD is missing." },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const submitted = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  if (!safeEqual(submitted, expected)) {
    return NextResponse.json({ error: "That password didn't match." }, { status: 401 });
  }

  // Only ever redirect within this app, never to a URL an attacker supplied.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const response = NextResponse.json({ ok: true, next: destination });
  response.cookies.set(SESSION_COOKIE, await sessionToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
