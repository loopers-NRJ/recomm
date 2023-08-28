/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import usePostingModal from "@/hooks/usePostingModal";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

const PostingModal = () => {
  const postingModal = usePostingModal();

  const [showModal, setShowModal] = useState(postingModal.isOpen);

  useEffect(() => {
    setShowModal(postingModal.isOpen);
  }, [postingModal.isOpen]);

  const onClose = () => {
    setShowModal(false);
    setTimeout(() => {
      postingModal.onClose();
    }, 300);
  };

  return (
    <Dialog.Root open={postingModal.isOpen}>
      <Dialog.Portal className="relative z-50">
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        {/* Content */}
        <Dialog.DialogContent
          className={`translate fixed inset-0 z-50 mx-auto h-full w-full rounded-lg bg-white p-8 text-foreground shadow-sm duration-300 md:my-10 md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5
            ${showModal ? "translate-y-0" : "translate-y-full"}
            ${showModal ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={onClose} />
          </Dialog.Close>
          {/* Form */}
          <form>
            Category
            <Input></Input>
            Category
            <Input></Input>
            Category
            <Input></Input>
            <Button variant={"default"}>Post</Button>
          </form>
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PostingModal;
