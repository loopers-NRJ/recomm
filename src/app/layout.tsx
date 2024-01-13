import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import { type Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
import BottomBar from "@/components/navbar/BottomBar"
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RECOMM",
  description: "Buy and sell your products here",
  icons: [{ rel: "icon", url: "recomm-favicon.png" }],
};

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
            <Navbar />
            {children}
            {device === "mobile" ? <BottomBar /> : <></>}
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}


