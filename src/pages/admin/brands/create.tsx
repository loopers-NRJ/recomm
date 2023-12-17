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

const CreateBrandPage = () => {
  const createBrandApi = api.brand.createBrand.useMutation();
  const [brandName, setBrandName] = useState("");

  const [error, setError] = useState<string>();
  const router = useRouter();

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const createBrand = async () => {
    try {
      await createBrandApi.mutateAsync({
        name: brandName,
        state: selectedState,
      });
      void router.push("/admin/brands");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="my-4">
          Brand Name
          <Input
            className="my-2"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => void createBrand()}
            disabled={brandName.trim() === "" || createBrandApi.isLoading}
          >
            Create Brand
          </Button>
        </div>
        {createBrandApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Creating Brand {brandName} ...
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

export default CreateBrandPage;
