import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  request.headers.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({ request });
}
