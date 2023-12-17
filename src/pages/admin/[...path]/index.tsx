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
import { withAdminGuard } from "@/hoc/AdminGuard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DefaultSearch } from "@/utils/constants";
import { debounce } from "@/utils/helper";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { states } from "@/types/prisma";
import { State } from "@prisma/client";
import { useAdminSelectedState } from "@/store/SelectedState";

import { useQueryState, parseAsString } from "next-usequerystate";

const titles = [
  "category",
  "featured-category",
  "brands",
  "models",
  "products",
  "users",
  "roles",
] as const;
type Title = (typeof titles)[number];

export interface TableProps {
  search?: string;
}

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
  let Table: React.FC<TableProps>;
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
      break;
    case "roles":
      Table = RoleTable;
      break;
  }

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(DefaultSearch)
  );
  const ref = useRef<HTMLInputElement>(null);
  const selectedState = useAdminSelectedState();

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
      <div className="hidden h-fit w-40 shrink-0 rounded-lg border md:block">
        <div className="flex h-full flex-col">
          {titles.map((title) => (
            <Button
              key={title}
              className={`
                justify-start rounded-none
                ${
                  new RegExp(`^/admin/${title}`).test(router.asPath)
                    ? "bg-accent text-accent-foreground"
                    : ""
                }
              `}
              variant="ghost"
              size="sm"
              onClick={() => {
                if (ref.current !== null) {
                  ref.current.value = "";
                }
                void router.push(`/admin/${title}`);
              }}
            >
              {title}
            </Button>
          ))}
        </div>
      </div>
      <div className="my-4 flex grow flex-col gap-3 md:m-0">
        <div className="flex w-full justify-between gap-3">
          <div className="flex w-full items-center gap-1 rounded-lg border ps-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={ref}
              placeholder="Search"
              role="search"
              type="search"
              defaultValue={search}
              onChange={debounce((e) => void setSearch(e.target.value), 300)}
              className="border-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Select
            onValueChange={(value) => {
              selectedState.onStateChange(value as State);
            }}
            value={selectedState.state}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="h-80">
              {states.map((state) => (
                <SelectItem value={state} key={state}>
                  {state.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table search={search} />
      </div>
    </Container>
  );
}
