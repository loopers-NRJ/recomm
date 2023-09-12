/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { LazyExoticComponent } from "react";

export enum Modals {
  BiddingModal,
  LoginModal,
  PostingModal,
  RegisterModal,
}

export const modalsConfig: Record<Modals, LazyExoticComponent<any>> = {
  [Modals.BiddingModal]: React.lazy(() => import("../BiddingModal")),
  [Modals.LoginModal]: React.lazy(() => import("../LoginModal")),
  [Modals.PostingModal]: React.lazy(() => import("../PostingModal")),
  [Modals.RegisterModal]: React.lazy(() => import("../RegisterModal")),
};
