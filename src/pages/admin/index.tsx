import { authOptions } from "@/server/auth";
import { AccessType } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

const AdminIndexPage = () => null;
export default AdminIndexPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  const accesses = session?.user.role?.accesses.map((access) => access.type);
  if (accesses?.includes(AccessType.readAccess)) {
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
