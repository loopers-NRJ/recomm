import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
// import { SpeedInsights } from '@vercel/speed-insights/next';

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import { type Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
// import BottomBar from "@/components/navbar/BottomBar";
// import LocationUpdater from "@/components/common/LocationUpdater";
// import TopLoader from "@/components/loading/TopLoader";
// import { Toaster } from "@/components/ui/toaster";
// import ModalRenderer from "@/components/modals/core/modal-renderer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RECOMM",
  description: "Buy and sell your products here",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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


