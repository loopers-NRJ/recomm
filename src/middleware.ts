import { type NextRequest, NextResponse } from "next/server";
import { pathHeaderName } from "./utils/constants";

export function middleware(request: NextRequest) {
  request.headers.set(pathHeaderName, request.nextUrl.pathname);

  return NextResponse.next({ request });
}
