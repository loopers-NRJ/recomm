import React, { Suspense } from "react";

export const ModalRenderer = () => {
  const LoginModal = React.lazy(() => import("../LoginModal"));
  const RegisterModal = React.lazy(() => import("../RegisterModal"));
  const BiddingModal = React.lazy(() => import("../BiddingModal"));
  const PostingModal = React.lazy(() => import("../PostingModal"));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginModal />
      <RegisterModal />
      <BiddingModal />
      <PostingModal />
    </Suspense>
  );
};
