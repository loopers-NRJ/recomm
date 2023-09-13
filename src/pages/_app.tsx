import "@/styles/globals.css";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { AppType } from "next/app";
import dynamic from "next/dynamic";

import BottomBar from "@/components/navbar/BottomBar";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/utils/api";

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
