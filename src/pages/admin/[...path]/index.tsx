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
import Link from "next/link";
import EmployeeTable from "@/components/admin/EmployeeTable";
import { withAdminGuard } from "@/components/hoc/AdminGuard";

const titles = [
  "category",
  "featured-category",
  "brands",
  "models",
  "products",
  "users",
  "employees",
  "roles",
] as const;
type Title = (typeof titles)[number];

export const getServerSideProps = withAdminGuard(async (context) => {
  const path = context.params?.path as [Title, ...string[]];

  if (path.length === 0 || !titles.includes(path[0])) {
    return {
      redirect: {
        destination: "/admin/category",
        permanent: true,
      },
    };
  }

  return {
    props: {
      title: path[0],
    },
  };
});

export default function AdminPage({ title }: { title: Title }) {
  const router = useRouter();

  let Table;
  switch (title) {
    case "category":
      Table = CategoryTable;
      break;
    case "featured-category":
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
    <Container className="pt-3 md:flex md:gap-2">
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
        <div className="flex h-full flex-col gap-2">
          {titles.map((title) => (
            <Link
              key={title}
              href={`/admin/${title}`}
              className="inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-center text-sm font-medium capitalize ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {title}
            </Link>
          ))}
        </div>
      </div>
      <div className="my-4 grow md:m-0">
        <Table />
      </div>
    </Container>
  );
}
