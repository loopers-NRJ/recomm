// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import usePostingModal from "@/hooks/usePostingModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

import { PostingTabs } from "../common/PostingTabs";

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
        <Dialog.Overlay
          onClick={postingModal.onClose}
          className="fixed inset-0 z-50 bg-black/50"
        />
        {/* Content */}
        <Dialog.DialogContent
          onKeyDown={(e) => {
            if (e.key === "Escape") postingModal.onClose();
          }}
          className={`translate fixed inset-0 z-50 mx-auto h-full w-full overflow-auto rounded-lg bg-white px-3 py-12 text-foreground shadow-sm duration-300 md:my-10 md:h-auto md:w-4/6 md:p-8 lg:h-auto lg:w-3/6 xl:w-2/5
            ${showModal ? "translate-y-0" : "translate-y-full"}
            ${showModal ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={onClose} />
          </Dialog.Close>
          {/* Form */}
          <PostingTabs
            setShowModal={setShowModal}
            postingModal={postingModal}
          />
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PostingModal;
