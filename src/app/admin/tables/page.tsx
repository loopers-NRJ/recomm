import AdminPage from "@/hoc/AdminPage";
import { hasAdminPageAccess } from "@/types/prisma";
import { permanentRedirect } from "next/navigation";

const AdminRoot = AdminPage(() => {
  permanentRedirect("/admin/tables/category");
}, hasAdminPageAccess);
export default AdminRoot;
