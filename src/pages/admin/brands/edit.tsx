import Container from "@/components/Container";
import { withAdminGuard } from "@/hoc/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import ServerError from "@/components/common/ServerError";

export const getServerSideProps = withAdminGuard();

const EditBrandPage = () => {
  const router = useRouter();
  const brandId = router.query.id as string | undefined;

  const updateBrandApi = api.brand.updateBrandById.useMutation();

  const brandApi = api.brand.getBrandById.useQuery({ brandId });

  const [brandName, setBrandName] = useState("");

  const [error, setError] = useState<string>();

  const updateBrand = async () => {
    if (brandApi.data == null) {
      return;
    }
    try {
      await updateBrandApi.mutateAsync({
        id: brandApi.data.id,
        name: brandName,
      });
      void router.push("/admin/brands");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  if (brandApi.isLoading) {
    return <Loading />;
  }
  if (brandApi.isError) {
    return (
      <ServerError
        message={brandApi.error?.message ?? "Something went wrong"}
      />
    );
  }
  if (brandApi.data === null) {
    return (
      <ServerError message={"Brand not found"}>Brand not found</ServerError>
    );
  }
  const { data: brand } = brandApi;
  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Brand - {brand.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              if (error) setError(undefined);
            }}
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => void updateBrand()}
            disabled={
              updateBrandApi.isLoading ||
              brandName.trim() === "" ||
              brandName === brand.name
            }
          >
            Update Brand
          </Button>
        </div>
        {updateBrandApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Brand {brandName} ...
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
};

export default EditBrandPage;
