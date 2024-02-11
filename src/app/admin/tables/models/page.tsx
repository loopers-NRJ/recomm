import AdminPage from "@/hoc/AdminPage";
import ModelTable from "./ModelTable";
import { AccessType } from "@prisma/client";

const ModelTablePage = AdminPage(ModelTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.createModel ||
      access === AccessType.updateModel ||
      access === AccessType.deleteModel,
  ),
);

export default ModelTablePage;
