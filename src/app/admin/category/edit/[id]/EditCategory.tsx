"use client";

import Container from "@/components/Container";
import { Label } from "@/components/ui/label";
import { type CategoryPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import EditableText from "../../../configurations/EditableText";
import VariantsTitleEditor from "./VariantsTitleEditor";
import { type Variant } from "@prisma/client";

export default function EditCategory({
  category,
  variants,
}: {
  category: CategoryPayloadIncluded;
  variants: Variant[];
}) {
  const router = useRouter();

  const update = api.category.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.refresh();
    },
    onError: errorHandler,
  });

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Category - {category.name}</h1>
        <Label className="flex items-center justify-between">
          <span>Name</span>
          <EditableText
            value={category.name}
            loading={update.isLoading}
            onSubmit={(value) => {
              update.mutate({
                id: category.id,
                name: value,
              });
            }}
          />
        </Label>
        <Label className="flex items-center justify-between">
          <span>Price</span>
          <EditableText
            value={category.price.toString()}
            loading={update.isLoading}
            type="number"
            onSubmit={(value) => {
              update.mutate({
                id: category.id,
                price: +value,
              });
            }}
          />
        </Label>

        <VariantsTitleEditor variants={variants} categoryId={category.id} />
      </section>
    </Container>
  );
}
