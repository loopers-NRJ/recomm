"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BrandPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

export default function EditBrand({ brand }: { brand: BrandPayloadIncluded }) {
  const router = useRouter();

  const updateBrandApi = api.brand.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push("/admin/tables/brands");
    },
    onError: errorHandler,
  });

  const [brandName, setBrandName] = useState("");

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Brand - {brand.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() =>
              updateBrandApi.mutate({
                id: brand.id,
                name: brandName,
              })
            }
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
      </section>
    </Container>
  );
}
