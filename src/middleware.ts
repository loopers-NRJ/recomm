import { type NextRequest, NextResponse, userAgent } from "next/server";
import { DEVICE_OS_HEADER_NAME, DEVICE_TYPE_HEADER_NAME } from "./utils/constants";

export function middleware(request: NextRequest) {
  const { device, os } = userAgent(request);
  const deviceType = device.type === "mobile" ? "mobile" : "desktop";
  const headers = new Headers(request.headers);
  headers.set(DEVICE_TYPE_HEADER_NAME, deviceType);
  if (os.name) {
    headers.set(DEVICE_OS_HEADER_NAME, os.name);
  }

  return NextResponse.next({ request: { headers } });
}
