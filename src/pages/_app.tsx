import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";

import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar/Navbar";

import "@/styles/globals.css";
import BottomBar from "@/components/navbar/BottomBar";
import dynamic from "next/dynamic";

const ModalRenderer = dynamic(
  () => import("../components/modals/core/modal-renderer"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <div className="pb-20 pt-28">
        <Component {...pageProps} session={session} />
      </div>
      <BottomBar />
      <Toaster />
      <ModalRenderer />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
