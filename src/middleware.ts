import { type NextRequest, NextResponse, userAgent } from "next/server";
import { deviceTypeHeaderName, pathHeaderName } from "./utils/constants";

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  const { device } = userAgent(request)
  const deviceType = device.type === 'mobile' ? 'mobile' : 'desktop'

  request.headers.set(pathHeaderName, url.pathname);
  request.headers.set(deviceTypeHeaderName, deviceType);

  return NextResponse.next({ request });
}
