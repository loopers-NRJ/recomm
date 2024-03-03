import { type NextRequest, NextResponse, userAgent } from "next/server";
import { DEVICE_TYPE_HEADER_NAME, PATH_HEADER_NAME } from "./utils/constants";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  const { device } = userAgent(request);
  const deviceType = device.type === "mobile" ? "mobile" : "desktop";

  request.headers.set(PATH_HEADER_NAME, url.pathname);
  request.headers.set(DEVICE_TYPE_HEADER_NAME, deviceType);

  return NextResponse.next({ request });
}
