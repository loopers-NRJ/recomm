// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
import { FC } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

interface PostingModalProps {
  children: React.ReactNode;
  className?: string;
}

const AdminPageModal: FC<PostingModalProps> = ({
  children,
  className = "",
}) => {
  const { visibility, close } = useAdminModal();
  return (
    <Dialog.Root open={visibility}>
      <Dialog.Portal className="relative z-50">
        {/* Overlay */}
        <Dialog.Overlay
          onClick={close}
          className="fixed inset-0 z-50 bg-black/50"
        />
        {/* Content */}
        <Dialog.DialogContent
          onKeyDown={(e) => e.key === "Escape" && close()}
          className={cn(
            `fixed inset-0 z-50 mx-auto h-full w-full overflow-auto rounded-lg bg-white p-8 text-foreground shadow-sm transition-all duration-300 md:my-10 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5
            ${visibility ? "translate-y-0" : "translate-y-full"}
            ${visibility ? "opacity-100" : "opacity-0"}`,
            className
          )}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={close} />
          </Dialog.Close>
          {/* Form */}
          {children}
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminPageModal;
