/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { HTTPHeaders, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import { type AppRouter } from "@/server/api/root";
import {
  RequestPathHeaderName,
  UserLatitudeHeaderName,
  UserLongitudeHeaderName,
} from "./constants";
import { ErrorLink } from "./ErrorLink";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

// location of the user
let userLatitute: string | undefined;
let userLongitude: string | undefined;
export const setUserLocation = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  userLatitute = `${latitude}`;
  userLongitude = `${longitude}`;
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        // loggerLink({
        //   enabled: (opts) =>
        //     process.env.NODE_ENV === "development" ||
        //     (opts.direction === "down" && opts.result instanceof Error),
        // }),
        ErrorLink,
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers: HTTPHeaders = {};
            if (typeof window !== "undefined") {
              headers[RequestPathHeaderName] = window.location.pathname;
            }
            if (userLatitute !== undefined && userLongitude !== undefined) {
              headers[UserLatitudeHeaderName] = userLatitute;
              headers[UserLongitudeHeaderName] = userLongitude;
            }
            return headers;
          },
        }),
      ],
    };
  },

  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
