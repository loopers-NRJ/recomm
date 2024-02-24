import AdminPage from "@/hoc/AdminPage";
import { AccessType } from "@prisma/client";
import Configurations from "./Configurations";

const ConfigurationsPage = AdminPage(Configurations, AccessType.updateUser);

export default ConfigurationsPage;
