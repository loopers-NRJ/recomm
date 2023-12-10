import { getServerAuthSession } from "@/server/auth";
import { type GetServerSideProps } from "next";

export const withProtectedRoute = (
  func?: GetServerSideProps
): GetServerSideProps => {
  return async (context) => {
    const session = await getServerAuthSession(context);
    if (session?.user) {
      return func ? func(context) : { props: {} };
    } else {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }
  };
};
