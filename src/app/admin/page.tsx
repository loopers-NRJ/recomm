import AdminPage from "@/hoc/AdminPage";
import { permanentRedirect } from "next/navigation";

const AdminRoot = AdminPage(() => {
  permanentRedirect("/admin/tables/category");
});
export default AdminRoot;
