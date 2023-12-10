import { RoleRouter } from "@/server/api/routers/role";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";
import { type GetServerSideProps } from "next";

/**
 * Wrapper for getServerSideProps
 * @param func
 * @returns GetServerSideProps
 */
export const withAdminGuard = (
  func?: GetServerSideProps
): GetServerSideProps => {
  return async (context) => {
    const pathname = context.resolvedUrl;
    const isAdminPage = pathname.match(/admin/g) !== null;
    const success = () => (func ? func(context) : { props: {} });
    const failure = () => ({
      redirect: {
        destination: "/404",
        permanent: false,
      },
    });
    if (!isAdminPage) {
      return success();
    }
    const session = await getServerAuthSession(context);
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
