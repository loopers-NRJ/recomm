import type { DefaultParams, DefaultSearchParams, Page } from "@/types/custom";
import { getServerAuthSession } from "@/server/auth";
import { permanentRedirect } from "next/navigation";
import { api } from "@/trpc/server";
import { type Address } from "@prisma/client";
import { type PagePropsWithSession } from "./AuthenticatedPage";
import { type ReactNode } from "react";

type NonEmptyAddressList = [Address, ...Address[]];

// type of the component passed to the ProfileCompletedPage
export interface PagePropsWithAddress<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
> extends PagePropsWithSession<Params, SearchParams> {
  addresses: NonEmptyAddressList;
}

export type PageWithAddress<
  Params = DefaultParams,
  SearchParams = DefaultParams,
> = (
  props: PagePropsWithAddress<Params, SearchParams>,
) => ReactNode;

export default function ProfileCompletedPage<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
>(
  Component: PageWithAddress<Params, SearchParams>,
  callerPath: string,
): Page<Params, SearchParams> {
  return async (props) => {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return permanentRedirect(
        `/login?callbackUrl=${encodeURIComponent(callerPath)}`,
      );
    }

    const addresses = await api.address.all.query();
    if (addresses.length === 0 || session.user.mobile === null) {
      return permanentRedirect(
        `/login/details?callbackUrl=${encodeURIComponent(callerPath)}`,
      );
    }

    return (
      <Component
        {...props}
        session={session}
        addresses={addresses as NonEmptyAddressList}
      />
    );
  };
}
