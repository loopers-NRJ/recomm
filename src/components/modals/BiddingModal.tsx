/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { FC, useEffect, useState } from "react";

import useBiddingModal from "@/hooks/useBiddingModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

import BidForm from "../BidForm";
import { DialogHeader } from "../ui/dialog";

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
      <Dialog.Portal
      // TODO: Fix this
      // className="relative z-50"
      >
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        {/* Content */}
        <div className="fixed right-0 top-0 z-50 flex h-full w-full items-end justify-center md:items-center">
          <Dialog.DialogContent
            className={`translate relative z-50 h-[40%] w-full overflow-auto rounded-xl bg-white p-8 text-foreground shadow-sm duration-300 md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5
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
            <BidForm roomId={biddingModal.roomId} onClose={onClose} />
          </Dialog.DialogContent>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BiddingModal;
