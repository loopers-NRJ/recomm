import AdminPage from "@/hoc/AdminPage";
import ReportTable from "./ReportTable";
import { AccessType } from "@prisma/client";

const ReportTablePage = AdminPage(ReportTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.viewReports || access === AccessType.deleteReport,
  ),
);

export default ReportTablePage;
