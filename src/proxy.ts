import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@username to /(profile)/username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2); // Remove "/@"
    const url = request.nextUrl.clone();
    url.pathname = `/${username}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/@:path*"],
};
