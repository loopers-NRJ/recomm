import "server-only";

import type { DefaultParams, DefaultSearchParams } from "@/types/custom";

import AuthenticatedPage, {
  type PagePropsWithSession,
} from "./AuthenticatedPage";

import { permanentRedirect } from "next/navigation";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";

// type of the props
export interface PagePropsWithAccesses<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
> extends PagePropsWithSession<Params, SearchParams> {
  accesses: { type: AccessType }[];
}

// type of the component passed to the AuthenticatedPage
export type PageWithAccesses<
  Params = DefaultParams,
  SearchParams = DefaultParams,
> = (
  props: PagePropsWithAccesses<Params, SearchParams>,
) => JSX.Element | Promise<JSX.Element>;

export default function AdminPage<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
>(
  Component: PageWithAccesses<Params, SearchParams>,
): PageWithAccesses<Params, SearchParams> {
  return AuthenticatedPage(async (props) => {
    const roleId = props.session?.user.roleId;
    if (!roleId) {
      return permanentRedirect("/login");
    }

    const accesses = (await api.role.getRole.query({ id: roleId }))?.accesses;
    const hasAccess = accesses
      ?.map((access) => access.type)
      .includes(AccessType.readAccess);

    if (!hasAccess) {
      return permanentRedirect("/login");
    }

    return <Component {...props} accesses={accesses!} />;
  });
}
