"use client";

import Container from "@/components/Container";
import Loading from "@/components/common/Loading";
import ServerError from "@/components/common/ServerError";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { camelOrPascalCaseToWords } from "@/utils/functions";
import EditableText from "./EditableText";
import { errorHandler } from "@/utils/errorHandler";
import { useState } from "react";

export default function Configurations() {
  const appConfigurations = api.configuration.all.useQuery();

  const [updatingConfigurationKey, setUpdatingConfigurationKey] =
    useState<string>("");

  const setConfiguration = api.configuration.set.useMutation({
    onMutate: (config) => {
      setUpdatingConfigurationKey(config.key);
    },
    onSuccess: async () => {
      await appConfigurations.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setUpdatingConfigurationKey("");
    },
  });

  if (appConfigurations.isError)
    return <ServerError message={appConfigurations.error.message} />;
  if (appConfigurations.isLoading) return <Loading />;

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">Product Selling Attributes</h1>
        <div className="flex flex-col gap-3">
          {appConfigurations.data.map((configuration) => (
            <Label
              className="flex items-center justify-between"
              key={configuration.key}
            >
              <span>{camelOrPascalCaseToWords(configuration.key)}</span>
              <EditableText
                value={configuration.value}
                onSubmit={(value) => {
                  setConfiguration.mutate({
                    key: configuration.key,
                    value,
                  });
                }}
                loading={updatingConfigurationKey === configuration.key}
              />
            </Label>
          ))}
        </div>
      </section>
    </Container>
  );
}
