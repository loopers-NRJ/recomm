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

  const [categoryName, setCategoryName] = useState("");

  const [error, setError] = useState<string>();

  const updateCategory = async () => {
    if (categoryName.trim() === "") {
      return setError("Category name cannot be empty");
    }
    updateCategoryApi.mutate({
      id: category.id,
      name: categoryName,
    });
  };

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Category - {category.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              if (error) {
                setError(undefined);
              }
            }}
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => void updateCategory()}
            disabled={
              updateCategoryApi.isLoading ||
              categoryName.trim() === "" ||
              categoryName === category.name
            }
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

        {error && (
          <div className="rounded-lg border border-red-500 p-2 text-red-500">
            {error}
          </div>
        )}
      </section>
    </Container>
  );
}
