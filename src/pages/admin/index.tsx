import { withAdminGuard } from "@/hoc/AdminGuard";

export default function AdminIndexPage() {
  return null;
}

export const getServerSideProps = withAdminGuard(async () => {
  return {
    redirect: {
      destination: "/admin/category",
      permanent: true,
    },
  };
});
