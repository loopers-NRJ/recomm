import Container from "@/components/Container";
import { withAdminGuard } from "@/hoc/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAdminSelectedState } from "@/store/SelectedState";

export const getServerSideProps = withAdminGuard();

const CreateCategoryPage = () => {
  const createCategoryApi = api.category.createCategory.useMutation();
  const [categoryName, setCategoryName] = useState("");
  const selectedState = useAdminSelectedState((selected) => selected.state);

  const router = useRouter();
  const parentName = router.query.parentName as string | undefined;
  const parentId = router.query.parentId as string | undefined;

  if (
    createCategoryApi.isSuccess &&
    createCategoryApi.data !== undefined &&
    !createCategoryApi.isError
  ) {
    void router.push("/admin/category");
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
            // onClick={() => void uploadImage()}
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

export default CreateCategoryPage;
