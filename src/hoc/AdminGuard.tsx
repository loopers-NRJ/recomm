import { RoleRouter } from "@/server/api/routers/role";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { adminPageRegex } from "@/utils/constants";
import { AccessType } from "@prisma/client";
import type {
  PreviewData,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import type { Session } from "next-auth";
import { ParsedUrlQuery } from "querystring";

export type CustomGetServerSideProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends Record<string, any> = Record<string, any>,
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  Preview extends PreviewData = PreviewData
> = (
  context: GetServerSidePropsContext<Params, Preview>,
  session: Session
) => Promise<GetServerSidePropsResult<Props>>;

/**
 * Wrapper for getServerSideProps
 * @param func
 * @returns GetServerSideProps
 */
export const withAdminGuard = (
  func?: CustomGetServerSideProps
): GetServerSideProps => {
  return async (context) => {
    const pathname = context.resolvedUrl;
    const isAdminPage = pathname.match(adminPageRegex) !== null;
    const session = await getServerAuthSession(context);
    if (session === null) {
      return {
        redirect: {
          destination: "/admin/login",
          permanent: false,
        },
      };
    }
    const success = () => (func ? func(context, session) : { props: {} });
    const failure = () => ({
      redirect: {
        destination: "/404",
        permanent: false,
      },
    });
    if (!isAdminPage) {
      return success();
    }
    const roleId = session?.user.roleId;

    if (!roleId) {
      return failure();
    }
    const accesses = (
      await RoleRouter.createCaller({ session, prisma, headers: {} }).getRole({
        id: roleId,
      })
    )?.accesses;

    const hasAccess = accesses
      ?.map((access) => access.type)
      .includes(AccessType.readAccess);

    if (!hasAccess) {
      return failure();
    }
    return success();
  };
};
