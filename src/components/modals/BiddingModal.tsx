/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import useBiddingModal from "@/hooks/useBiddingModal";
import { Cross1Icon } from "@radix-ui/react-icons";
import { FC, useEffect, useState } from "react";
import { DialogHeader } from "../ui/dialog";
import BidForm from "../BidForm";

const BiddingModal: FC = () => {
  const biddingModal = useBiddingModal();

  const [showModal, setShowModal] = useState(biddingModal.isOpen);

  useEffect(() => {
    setShowModal(biddingModal.isOpen);
  }, [biddingModal.isOpen]);

  const onClose = () => {
    setShowModal(false);
    setTimeout(() => {
      biddingModal.onClose();
    }, 300);
  };

  return (
    <Dialog.Root open={biddingModal.isOpen}>
      <Dialog.Portal className="relative z-50">
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        {/* Content */}
        <Dialog.DialogContent
          className={`translate fixed inset-0 z-50 mx-auto h-full w-full rounded-lg bg-white p-8 text-foreground shadow-sm duration-300 md:my-40 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5
            ${showModal ? "translate-y-0" : "translate-y-full"}
            ${showModal ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={onClose} />
          </Dialog.Close>

          <DialogHeader>
            <h1 className="text-2xl font-semibold">Place your Bid</h1>
          </DialogHeader>
          {/* Form */}
          <BidForm />
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BiddingModal;
