// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
import { FC } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

interface PostingModalProps {
  children: React.ReactNode;
  visibility: boolean;
  setVisibility: (visibility: boolean) => void;
}

const AdminPageModal: FC<PostingModalProps> = ({
  children,
  visibility,
  setVisibility,
}) => {
  return (
    <Dialog.Root open={visibility}>
      <Dialog.Portal className="relative z-50">
        {/* Overlay */}
        <Dialog.Overlay
          onClick={() => setVisibility(false)}
          className="fixed inset-0 z-50 bg-black/50"
        />
        {/* Content */}
        <Dialog.DialogContent
          onKeyDown={(e) => e.key === "Escape" && setVisibility(false)}
          className={`fixed inset-0 z-50 mx-auto h-full w-full rounded-lg bg-white p-8 text-foreground shadow-sm transition-all duration-300 md:my-10 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5
            ${visibility ? "translate-y-0" : "translate-y-full"}
            ${visibility ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={() => setVisibility(false)} />
          </Dialog.Close>
          {/* Form */}
          {children}
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminPageModal;
