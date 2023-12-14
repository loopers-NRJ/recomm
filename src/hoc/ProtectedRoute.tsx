import { getServerAuthSession } from "@/server/auth";
import {
  PreviewData,
  type GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { Session } from "next-auth";
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

export const withProtectedRoute = (
  func?: CustomGetServerSideProps
): GetServerSideProps => {
  return async (context) => {
    const session = await getServerAuthSession(context);
    if (session?.user) {
      return func ? func(context, session) : { props: {} };
    } else {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }
  };
};
