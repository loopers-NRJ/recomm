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

const EditModelPage = () => {
  const router = useRouter();
  const modelId = router.query.id as string | undefined;
  const updateModelApi = api.model.updateModelById.useMutation();

  const modelApi = api.model.getModelById.useQuery({ modelId });

  const [modelName, setModelName] = useState("");

  const [error, setError] = useState<string>();

  const updateModel = async () => {
    if (modelApi.data == null || modelApi.isError) {
      return;
    }

    try {
      await updateModelApi.mutateAsync({
        id: modelApi.data.id,
        name: modelName,
      });
      void router.push("/admin/models");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  if (modelApi.isLoading) {
    return <Loading />;
  }

  if (modelApi.isError) {
    return (
      <ServerError
        message={modelApi.error?.message ?? "something went wrong"}
      />
    );
  }
  if (modelApi.data === null) {
    return (
      <ServerError message={"model not found"}>model not found</ServerError>
    );
  }

  const { data: model } = modelApi;

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
};

export default EditModelPage;
