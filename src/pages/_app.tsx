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
import { useRouter } from "next/router";

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

  const pathname = useRouter().pathname;

  const isAdminPage = pathname.match(/admin/g) !== null;

  return (
    <div>
      {!isAdminPage ? (
        <p className="mt-[200px] hidden text-center md:block">
          only mobile view available at the moment
        </p>
      ) : null}
      <div className={isAdminPage ? "" : "md:hidden"}>
        <SessionProvider session={session}>
          <Navbar />
          <div className={isAdminPage ? "pb-20 pt-28" : "pb-20"}>
            <Component {...pageProps} session={session} />
          </div>
          <BottomBar />
          <Toaster />
          <ModalRenderer />
        </SessionProvider>
      </div>
    </div>
  );
};

export default api.withTRPC(MyApp);
