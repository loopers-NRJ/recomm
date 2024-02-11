import { AccessType } from "@prisma/client";
import BrandTable from "./BrandTable";
import AdminPage from "@/hoc/AdminPage";

const BrandTablePage = AdminPage(BrandTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.createBrand ||
      access === AccessType.updateBrand ||
      access === AccessType.deleteBrand,
  ),
);

export default BrandTablePage;
