import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const hostname = request.nextUrl.hostname.toLowerCase();
  const isPublicDomain = hostname === "anuncio.top" || hostname === "www.anuncio.top";
  const isHttp = forwardedProtocol === "http" || request.nextUrl.protocol === "http:";

  if (isPublicDomain && (isHttp || hostname === "www.anuncio.top")) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.hostname = "anuncio.top";
    destination.port = "";
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"
};
