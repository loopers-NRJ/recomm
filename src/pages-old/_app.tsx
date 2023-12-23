import "@/styles/globals.css";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import dynamic from "next/dynamic";

import BottomBar from "@/components/navbar/BottomBar";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/utils/api";
import Head from "next/head";
import TopLoader from "nextjs-progressbar";

import LocationUpdater from "@/components/common/LocationUpdater";
import { SpeedInsights } from "@vercel/speed-insights/next";

const ModalRenderer = dynamic(
  () => import("../components/modals/core/modal-renderer"),
  {
    loading: () => null,
    ssr: false,
  },
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>RECOMM</title>
        <link
          rel="shortcut icon"
          href="recomm-favicon.png"
          type="image/x-icon"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="description"
          content="RECOMM is a platform for sharing recommendations."
        />
      </Head>
      <SpeedInsights />
      <>
        <SessionProvider session={session}>
          <LocationUpdater />
          <TopLoader />
          <Navbar />
          <Component {...pageProps} session={session} />
          <BottomBar />
          <Toaster />
          <ModalRenderer />
        </SessionProvider>
      </>
    </>
  );
};

export default api.withTRPC(MyApp);
