import Container from "@/components/Container";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authOptions } from "@/server/auth";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Role } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user.role === undefined || session.user.role === Role.USER) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
const EditBrandPage = () => {
  const router = useRouter();
  const brandId = router.query.id as string | undefined;

  const updateBrandApi = api.brand.updateBrandById.useMutation();

  const brandApi = api.brand.getBrandById.useQuery({ brandId });

  const [brandName, setBrandName] = useState(brandApi.data?.name ?? "");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (brandApi.data && !(brandApi.data instanceof Error)) {
      setBrandName(brandApi.data.name);
    }
  }, [brandApi]);

  const updateBrand = async () => {
    if (brandApi.data == null || brandApi.data instanceof Error) {
      return;
    }
    let image;
    if (imageFiles.length > 0) {
      const result = await uploader.upload(imageFiles);
      if (result instanceof Error) {
        return setError(result.message);
      }
      image = result[0];
    }
    const result = await updateBrandApi.mutateAsync({
      id: brandApi.data.id,
      name: brandName,
      image,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    void router.push("/admin/brands");
  };

  if (brandApi.isLoading) {
    return <h1>Loading</h1>;
  }
  if (
    brandApi.isError ||
    brandApi.data instanceof Error ||
    brandApi.data === null
  ) {
    return <h1>Something went wrong</h1>;
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

        <div className="flex items-end justify-between gap-8">
          <ImagePicker
            setImages={setImageFiles}
            maxImages={1}
            images={imageFiles}
          />
          <Button
            onClick={() => void updateBrand()}
            disabled={
              uploader.isLoading ||
              updateBrandApi.isLoading ||
              brandName.trim() === "" ||
              brandName === brand.name
            }
          >
            {imageFiles.length > 0 ? "Upload Image" : "Update Brand"}
          </Button>
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loader2 className="animate-spin" />
          </div>
        )}
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
