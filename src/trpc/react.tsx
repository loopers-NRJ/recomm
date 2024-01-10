"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type HTTPHeaders, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useCallback, useState } from "react";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";
import { requestPathHeaderName } from "@/utils/constants";
import { ErrorLink } from "@/utils/ErrorLink";

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  cookies: string;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const getHeaders = useCallback(() => {
    const headers: HTTPHeaders = {
      cookie: props.cookies,
      "x-trpc-source": "react",
    };
    if (typeof window !== "undefined") {
      headers[requestPathHeaderName] = window.location.pathname;
    }
    return headers;
  }, [props.cookies]);

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        // loggerLink({
        //   enabled: (op) =>
        //     process.env.NODE_ENV === "development" ||
        //     (op.direction === "down" && op.result instanceof Error),
        // }),
        ErrorLink,
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers: getHeaders(),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
