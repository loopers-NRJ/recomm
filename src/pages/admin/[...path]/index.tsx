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
import FeaturedCategoryTable from "@/components/admin/FeaturedCategoryTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EmployeeTable from "@/components/admin/EmployeeTable";

const titles = [
  "category",
  "featured category",
  "brands",
  "models",
  "products",
  "users",
  "employees",
  "roles",
] as const;
type Title = (typeof titles)[number];

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
    case "featured category":
      Table = FeaturedCategoryTable;
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
    case "employees":
      Table = EmployeeTable;
      break;
    case "roles":
      Table = RoleTable;
      break;
  }

  return (
    <Container className="md:flex md:gap-3">
      <div className="md:hidden">
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
      <div className="hidden md:block">
        <div className="flex h-full flex-col gap-1">
          {titles.map((title) => (
            <Button
              variant="ghost"
              key={title}
              className={`rounded px-2 py-3 capitalize ${
                title === path[0] ? "text-primary-500" : ""
              }`}
            >
              <Link href={`/admin/${title}`} className="hover:text-primary-500">
                {title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="my-4 grow md:m-0">
        <Table />
      </div>
    </Container>
  );
};

export default AdminPage;
