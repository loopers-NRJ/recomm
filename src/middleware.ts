import { type NextRequest, NextResponse, userAgent } from "next/server";
import { DEVICE_TYPE_HEADER_NAME } from "./utils/constants";

export function middleware(request: NextRequest) {
  const { device } = userAgent(request);
  const deviceType = device.type === "mobile" ? "mobile" : "desktop";

  const headers = new Headers(request.headers);
  headers.set(DEVICE_TYPE_HEADER_NAME, deviceType);

  return NextResponse.next({ request: { headers } });
}
