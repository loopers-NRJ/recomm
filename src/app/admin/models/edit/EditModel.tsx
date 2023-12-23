import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ModelPayloadIncluded } from "@/types/prisma";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditModel({ model }: { model: ModelPayloadIncluded }) {
  const router = useRouter();
  const updateModelApi = api.model.updateModelById.useMutation();

  const [modelName, setModelName] = useState("");

  const [error, setError] = useState<string>();

  const updateModel = async () => {
    try {
      await updateModelApi.mutateAsync({
        id: model.id,
        name: modelName,
      });
      router.push("/admin/tables/models");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Edit Model - {model.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value);
              if (error) setError(undefined);
            }}
          />
        </Label>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() => void updateModel()}
            disabled={
              updateModelApi.isLoading ||
              modelName.trim() === "" ||
              modelName === model.name
            }
          >
            Update Model
          </Button>
        </div>
        {updateModelApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Model {modelName} ...
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
