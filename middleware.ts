import { NextRequest, NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locales";

// Redirect any non-prefixed path to a locale-prefixed one (/ -> /es, /party/x -> /es/party/x).
// Preferred locale: the `locale` cookie, then the Accept-Language header, then the default.
function preferredLocale(req: NextRequest): string {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
