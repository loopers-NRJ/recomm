import AdminPage from "@/hoc/AdminPage";
import CategoryTable from "./CategoryTable";
import { AccessType } from "@prisma/client";

const CategoryTablePage = AdminPage(CategoryTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.createCategory ||
      access === AccessType.updateCategory ||
      access === AccessType.deleteCategory,
  ),
);

export default CategoryTablePage;
