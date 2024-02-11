import AdminPage from "@/hoc/AdminPage";
import LogTable from "./LogTable";
import { AccessType } from "@prisma/client";

const FeaturedCategoryTablePage = AdminPage(LogTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.viewLogs || access === AccessType.clearLogs,
  ),
);

export default FeaturedCategoryTablePage;
