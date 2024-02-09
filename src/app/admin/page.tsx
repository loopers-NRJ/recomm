import AdminPage from "@/hoc/AdminPage";
import { permanentRedirect } from "next/navigation";

const AdminRoot = AdminPage(async () => {
  permanentRedirect("/admin/tables/category");
});

export default AdminRoot;
