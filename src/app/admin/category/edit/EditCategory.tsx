"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type CategoryPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

export default function EditCategory({
  category,
}: {
  category: CategoryPayloadIncluded;
}) {
  const router = useRouter();

  const updateCategoryApi = api.category.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push("/admin/tables/category");
    },
    onError: errorHandler,
  });

  const [categoryName, setCategoryName] = useState(category.name);
  const [categoryPrice, setCategoryPrice] = useState(category.price.toString());

  const updateCategory = async () => {
    if (categoryName.trim() === "") {
      return toast.error("Category name cannot be empty");
    }
    if (!+categoryPrice) {
      return toast.error("Invalid price");
    }
    if (categoryName === category.name && +categoryPrice === category.price) {
      return toast.error("No changes to update");
    }

    updateCategoryApi.mutate({
      id: category.id,
      name: categoryName,
      price: +categoryPrice,
    });
  };

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Category - {category.name}</h1>
        <Label className="flex flex-col gap-1">
          New name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
            }}
            placeholder="Enter here"
          />
        </Label>
        <Label className="flex flex-col gap-1">
          New price
          <Input
            className="my-2"
            value={categoryPrice}
            onChange={(e) => setCategoryPrice(e.target.value)}
            placeholder="New price"
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => void updateCategory()}
            disabled={updateCategoryApi.isLoading}
          >
            Update category
          </Button>
        </div>
        {updateCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Category {categoryName} ...
            <Loader2 className="animate-spin" />
          </div>
        )}
      </section>
    </Container>
  );
}
