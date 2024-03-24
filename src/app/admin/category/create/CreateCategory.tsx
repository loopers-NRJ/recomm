"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import VariantsTitleEditor, { type VariantsList } from "./VariantsTitleEditor";

const CreateCategory = () => {
  const params = useSearchParams();
  const router = useRouter();
  const parentName = params.get("parentName");
  const parentId = params.get("parentId");

  const createCategoryApi = api.category.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push("/admin/tables/category");
    },
    onError: errorHandler,
  });
  const [categoryName, setCategoryName] = useState("");
  const [categoryPrice, setCategoryPrice] = useState("");
  const city = useAdminselectedCity((selected) => selected.city?.value);
  const [variants, setVariants] = useState<VariantsList>();

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Create New Category</h1>
        <Label className="flex flex-col gap-1">
          Category Name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter here"
          />
        </Label>
        <Label className="flex flex-col gap-1">
          Category Price
          <Input
            type="number"
            placeholder="Enter here"
            value={categoryPrice}
            onChange={(e) => setCategoryPrice(e.target.value)}
          />
        </Label>
        <VariantsTitleEditor values={variants} setValues={setVariants} />

        <Label className="flex items-center justify-between p-1">
          <div>Parent Category</div>
          <div>{parentName ?? "None"}</div>
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => {
              if (!city) return toast.error("Select a state");
              createCategoryApi.mutate({
                name: categoryName,
                parentCategoryId: parentId ?? undefined,
                city,
                price: +categoryPrice,
                variants,
              });
            }}
            disabled={
              categoryName.trim() === "" ||
              !+categoryPrice ||
              createCategoryApi.isLoading
            }
          >
            Create Category
          </Button>
        </div>

        {createCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Creating Category {categoryName} ...
            <Loader2 className="animate-spin" />
          </div>
        )}
        {createCategoryApi.isError && (
          <div className="rounded-lg border border-red-500 p-2">
            {createCategoryApi.error.message}
          </div>
        )}
        {createCategoryApi.isError && (
          <div className="rounded-lg border border-red-500 p-2">
            Something went wrong
          </div>
        )}
      </section>
    </Container>
  );
};

export default CreateCategory;
