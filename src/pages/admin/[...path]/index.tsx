import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";

import BrandTable from "@/components/admin/brand/Table";
import CategoryTable from "@/components/admin/category/Table";
import ModelTable from "@/components/admin/model/Table";
import ProductsTable from "@/components/admin/product/Table";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAdminModal from "@/hooks/useAdminModel";
import { authOptions } from "@/server/auth";
import { Role } from "@prisma/client";

const titles = ["category", "brands", "models", "products"] as const;
type Title = (typeof titles)[number];
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const AdminPage = () => {
  const router = useRouter();
  const path = router.query.path;
  const { open } = useAdminModal();

  // check if the path is valid title
  if (
    !path ||
    !(path instanceof Array) ||
    path.length === 0 ||
    !titles.includes(path[0] as Title)
  ) {
    return (
      <Container>
        <div className="flex h-12 items-center text-lg font-bold">
          Admin Page
        </div>
        <div className="my-4">Invalid path</div>
      </Container>
    );
  }

  const title = path[0] as Title;

  let Table: React.FC<{ path: string[] }>;
  switch (title) {
    case "category":
      Table = CategoryTable;
      break;
    case "brands":
      Table = BrandTable;
      break;
    case "models":
      Table = ModelTable;
      break;
    case "products":
      Table = ProductsTable;
      break;
  }

  return (
    <Container>
      <div className="flex justify-between">
        <Select
          onValueChange={(value) => void router.push(`/admin/${value}`)}
          value={title}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {titles.map((title) => (
              <SelectItem value={title} key={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {title !== "products" && <Button onClick={open}>New</Button>}
      </div>
      <div className="my-4">
        <Table path={path.slice(1)} />
      </div>
    </Container>
  );
};

export default AdminPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (
    session?.user.role !== Role.ADMIN_READ &&
    session?.user.role !== Role.ADMIN_WRITE
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
