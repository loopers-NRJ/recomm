import { useRouter } from "next/router";

import BrandTable from "@/components/admin/BrandTable";
import CategoryTable from "@/components/admin/CategoryTable";
import ModelTable from "@/components/admin/ModelTable";
import ProductsTable from "@/components/admin/ProductTable";
import UserTable from "@/components/admin/UserTable";
import Container from "@/components/Container";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoleTable from "@/components/admin/RoleTable";

const titles = [
  "category",
  "brands",
  "models",
  "products",
  "users",
  "roles",
] as const;
type Title = (typeof titles)[number];
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const AdminPage = () => {
  const router = useRouter();
  const path = router.query.path;

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

  let Table;
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
    case "users":
      Table = UserTable;
      break;
    case "roles":
      Table = RoleTable;
  }

  return (
    <Container>
      <div className="flex justify-between">
        <Select
          onValueChange={(value) => void router.push(`/admin/${value}`)}
          value={title}
        >
          <SelectTrigger className="w-[180px] capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {titles.map((title) => (
              <SelectItem value={title} key={title} className="capitalize">
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="my-4">
        <Table />
      </div>
    </Container>
  );
};

export default AdminPage;
