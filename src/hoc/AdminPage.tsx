import "server-only";

import type { DefaultParams, DefaultSearchParams, Page } from "@/types/custom";

import AuthorizedPage, { type PagePropsWithSession } from "./AuthenticatedPage";

import { permanentRedirect } from "next/navigation";
import { api } from "@/trpc/server";
import { type AccessType } from "@prisma/client";
import { type ReactNode } from "react";

// type of the props
export interface PagePropsWithAccesses<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
> extends PagePropsWithSession<Params, SearchParams> {
  accesses: AccessType[];
}

// type of the component passed to the AuthenticatedPage
export type PageWithAccesses<
  Params = DefaultParams,
  SearchParams = DefaultParams,
> = (
  props: PagePropsWithAccesses<Params, SearchParams>,
) => ReactNode | Promise<ReactNode>;

export default function AdminPage<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
>(
  Component: PageWithAccesses<Params, SearchParams>,
  requiredAccessTypes:
    | AccessType
    | [AccessType, AccessType, ...AccessType[]]
    | ((access: AccessType[]) => boolean),
): Page<Params, SearchParams> {
  return AuthorizedPage(async (props) => {
    const roleId = props.session?.user.roleId;
    if (!roleId) {
      return permanentRedirect("/login");
    }

    const accesses = (await api.role.byId.query({ id: roleId }))?.accesses;
    const userAccessTypes = accesses?.map((access) => access.type);
    const hasAccess =
      requiredAccessTypes instanceof Array
        ? requiredAccessTypes.every(
            (access) => userAccessTypes?.includes(access),
          )
        : requiredAccessTypes instanceof Function
          ? requiredAccessTypes(userAccessTypes!)
          : userAccessTypes?.includes(requiredAccessTypes);

    if (!hasAccess) {
      return permanentRedirect("/login");
    }

    return <Component {...props} accesses={userAccessTypes!} />;
  });
}
