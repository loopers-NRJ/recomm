"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateBrand() {
  const createBrandApi = api.brand.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push("/admin/tables/brands");
    },
    onError: errorHandler,
  });
  const [brandName, setBrandName] = useState("");

  const router = useRouter();

  const city = useAdminselectedCity((selected) => selected.city?.value);

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
            onClick={() => {
              if (!city) return toast.error("Select a city");
              createBrandApi.mutate({
                name: brandName,
                city,
              });
            }}
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
      </section>
    </Container>
  );
}
