import AdminPage from "@/hoc/AdminPage";
import FeaturedCategoryTable from "./FeaturedCategoryTable";
import { AccessType } from "@prisma/client";

const FeaturedCategoryTablePage = AdminPage(FeaturedCategoryTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.createCategory ||
      access === AccessType.updateCategory ||
      access === AccessType.deleteCategory,
  ),
);

export default FeaturedCategoryTablePage;
