import "@/styles/globals.css";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { AppType } from "next/app";
import dynamic from "next/dynamic";

import BottomBar from "@/components/navbar/BottomBar";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { api, setUserLocation } from "@/utils/api";
import { useEffect } from "react";
import Head from "next/head";
import TopLoader from "nextjs-progressbar";

import { SpeedInsights } from "@vercel/speed-insights/next";

const ModalRenderer = dynamic(
  () => import("../components/modals/core/modal-renderer"),
  {
    loading: () => null,
    ssr: false,
  }
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    if (session?.user) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
        },
        () => {
          // TODO: handle error
        }
      );
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>RECOMM</title>
        <link
          rel="shortcut icon"
          href="recomm-favicon.png"
          type="image/x-icon"
        />
      </Head>
      <div>
        <SessionProvider session={session}>
          <TopLoader color="black" />
          <Navbar />
          <Component {...pageProps} session={session} />
          <BottomBar />
          <Toaster />
          <ModalRenderer />
        </SessionProvider>
        <SpeedInsights />
      </div>
    </>
  );
};

export default api.withTRPC(MyApp);
