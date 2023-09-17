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

const titles = ["category", "brands", "models", "products"] as const;
type Title = (typeof titles)[number];
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const AdminPage = () => {
  const router = useRouter();
  const path = router.query.path as [string, ...string[]];
  const title = path[0] as Title;
  const { toggle } = useAdminModal();
  // check if the path is valid title
  if (!titles.includes(title)) {
    return (
      <Container>
        <div className="flex h-12 items-center text-lg font-bold">
          Admin Page
        </div>
        <div className="my-4">Invalid path</div>
      </Container>
    );
  }

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

        <Button onClick={toggle}>New</Button>
      </div>
      <div className="my-4">
        <Table path={path.slice(1)} />
      </div>
    </Container>
  );
};

export default AdminPage;
