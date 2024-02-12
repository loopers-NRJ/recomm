import AdminPage from "@/hoc/AdminPage";
import CreateBrand from "./CreateBrand";
import { AccessType } from "@prisma/client";

const CreateBrandPage = AdminPage(CreateBrand, AccessType.createBrand);

export default CreateBrandPage;
