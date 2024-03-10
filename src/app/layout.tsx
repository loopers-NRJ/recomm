import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import type { Viewport, Metadata } from "next";
import BottomBar from "@/components/navbar/BottomBar"
import { SpeedInsights } from "@vercel/speed-insights/next";
import MobileNavbar from "@/components/navbar/mobile-navbar";
import DesktopNavbar from "@/components/navbar/desktop-navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RECOMM",
  description: "Buy and sell your products here",
  icons: [{ rel: "icon", url: "/recomm-favicon.png" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const device = headers().get("x-device-type")
  return (
    <html lang="en">
      <head>
        <SpeedInsights />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider cookies={cookies().toString()}>
          <Providers >
            {device === "mobile" ? <MobileNavbar /> : <DesktopNavbar />}
            {children}
            {device === "mobile" ? <BottomBar /> : <></>}
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}


