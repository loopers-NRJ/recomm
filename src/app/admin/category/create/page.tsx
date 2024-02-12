import AdminPage from "@/hoc/AdminPage";
import CreateCategory from "./CreateCategory";
import { AccessType } from "@prisma/client";

const CreateCategoryPage = AdminPage(CreateCategory, AccessType.createCategory);
export default CreateCategoryPage;
