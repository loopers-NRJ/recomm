import AdminPage from "@/hoc/AdminPage";
import ProductTable from "./ProductTable";
import { AccessType } from "@prisma/client";

const ProductTablePage = AdminPage(ProductTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.updateProduct ||
      access === AccessType.deleteProduct,
  ),
);

export default ProductTablePage;
