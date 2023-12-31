"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CreateCategory = () => {
  const createCategoryApi = api.category.createCategory.useMutation();
  const [categoryName, setCategoryName] = useState("");
  const selectedState = useAdminSelectedState((selected) => selected.state);

  const params = useSearchParams();
  const router = useRouter();
  const parentName = params.get("parentName");
  const parentId = params.get("parentId");
  console.log({ parentName, parentId });

  if (
    createCategoryApi.isSuccess &&
    createCategoryApi.data !== undefined &&
    !createCategoryApi.isError
  ) {
    router.push("/admin/tables/category");
  }

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="my-4">
          Category Name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Label>

        <Label className="flex items-center justify-between">
          <div>Parent Category</div>
          <div>{parentName ?? "None"}</div>
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() =>
              createCategoryApi.mutate({
                name: categoryName,
                parentCategoryId: parentId ?? undefined,
                state: selectedState,
              })
            }
            disabled={categoryName.trim() === "" || createCategoryApi.isLoading}
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
