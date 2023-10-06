import { authOptions } from "@/server/auth";
import { Role } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

const AdminIndexPage = () => null;
export default AdminIndexPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user.role === undefined || session.user.role === Role.USER) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    redirect: {
      destination: "/admin/category",
      permanent: false,
    },
  };
};
