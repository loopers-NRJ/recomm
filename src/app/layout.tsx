import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import { type Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
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
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}


