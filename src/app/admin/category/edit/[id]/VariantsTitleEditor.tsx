"use client";
import EditableText from "@/app/admin/configurations/EditableText";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import { type Variant } from "@prisma/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VariantsTitleEditor({
  variants,
  categoryId,
}: {
  variants: Variant[];
  categoryId: string;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const createVariant = api.variant.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Variant created successfully");
      setSearch("");
      router.refresh();
    },
    onError: errorHandler,
  });

  const updateVariant = api.variant.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Variant updated successfully");
      router.refresh();
    },
    onError: errorHandler,
  });

  const deleteVariant = api.variant.delete.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Variant deleted successfully");
      router.refresh();
    },
    onError: errorHandler,
  });

  return (
    <div className="w-full">
      <Label>variant names</Label>
      <div>
        <div className="flex flex-wrap gap-2 py-1">
          {variants.map((variant) => (
            <div className="relative flex items-center gap-1" key={variant.id}>
              <EditableText
                value={variant.title}
                loading={
                  (updateVariant.isLoading &&
                    updateVariant.variables?.variantId === variant.id) ||
                  (deleteVariant.isLoading &&
                    deleteVariant.variables?.variantId === variant.id)
                }
                onSubmit={(title) => {
                  updateVariant.mutate({
                    variantId: variant.id,
                    title,
                  });
                }}
              />

              <Badge
                onClick={() => {
                  deleteVariant.mutate({
                    variantId: variant.id,
                  });
                }}
                variant="outline"
                className="absolute -right-4 -top-4 z-10 flex w-fit scale-75 cursor-pointer items-center justify-center bg-white p-1 text-red-500 hover:bg-red-400 hover:text-white"
              >
                <Trash className="scale-[.75]" />
              </Badge>
            </div>
          ))}
        </div>
        <Label className="flex items-center gap-2">
          <Input
            type="text"
            // decrease the height of the input
            placeholder="Enter the choice and press `Enter Key`"
            onKeyDown={(e) => {
              const newTitle = search.trim();
              if (e.key === "Enter" && newTitle.length > 0) {
                createVariant.mutate({
                  categoryId,
                  title: newTitle,
                });
              }
            }}
            disabled={createVariant.isLoading}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Label>
      </div>
    </div>
  );
}
