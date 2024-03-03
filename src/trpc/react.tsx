"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useMemo } from "react";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";
import { ErrorLink } from "@/utils/ErrorLink";
import { usePathname } from "next/navigation";
import { PATH_HEADER_NAME } from "@/utils/constants";

export const api = createTRPCReact<AppRouter>();
const queryClient = new QueryClient();

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  cookies: string;
}) {
  const pathname = usePathname();
  const trpcClient = useMemo(
    () =>
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
            headers: {
              cookie: props.cookies,
              "x-trpc-source": "react",
              [PATH_HEADER_NAME]: pathname,
            },
          }),
        ],
      }),
    [pathname, props.cookies],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
