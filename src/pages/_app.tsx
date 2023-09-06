import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";

import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar/Navbar";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import PostingModal from "@/components/modals/PostingModal";
// import SearchModal from "@/components/modals/SearchModal";

import "@/styles/globals.css";
import BiddingModal from "@/components/modals/BiddingModal";
import BottomBar from "@/components/navbar/BottomBar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <LoginModal />
      <RegisterModal />
      <PostingModal />
      <BiddingModal />
      {/* <SearchModal /> */}
      <Navbar />
      <div className="pb-20 pt-28">
        <Component {...pageProps} session={session} />
      </div>
      <BottomBar />
      <Toaster />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
