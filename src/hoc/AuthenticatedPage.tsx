import "server-only";

import type {
  DefaultParams,
  DefaultSearchParams,
  PageProps,
} from "@/types/custom";

import { getServerAuthSession } from "@/server/auth";
import { permanentRedirect } from "next/navigation";
import type { Session } from "next-auth";

// type of the props
export interface PagePropsWithSession<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
> extends PageProps<Params, SearchParams> {
  session: Session;
}

// type of the component passed to the AuthenticatedPage
export type PageWithSession<
  Params = DefaultParams,
  SearchParams = DefaultParams,
> = (
  props: PagePropsWithSession<Params, SearchParams>,
) => JSX.Element | Promise<JSX.Element>;

export default function AuthenticatedPage<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
>(
  Component: PageWithSession<Params, SearchParams>,
): PageWithSession<Params, SearchParams> {
  return async (props) => {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return permanentRedirect("/login");
    }

    return <Component {...props} session={session} />;
  };
}
