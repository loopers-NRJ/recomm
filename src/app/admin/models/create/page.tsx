import AdminPage from "@/hoc/AdminPage";
import CreateModel from "./CreateModel";
import { AccessType } from "@prisma/client";

const CreateModelPage = AdminPage(CreateModel, AccessType.createModel);

export default CreateModelPage;
