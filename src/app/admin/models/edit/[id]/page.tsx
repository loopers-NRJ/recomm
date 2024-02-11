import Container from "@/components/Container";
import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import BasicInfoEditSection from "./basicInfo/BasicInfoEditSection";
import AdditionalInfoSection from "./additionalInfo/AdditionalInfoSection";
import { AccessType } from "@prisma/client";

const EditModelPage = AdminPage<{ id: string }>(async (props) => {
  const { id } = props.params;
  const model = await api.model.byId.query({ modelId: id });

  if (!model || model === "Model not found") {
    return notFound();
  }
  return (
    <Container className="flex flex-col gap-8 border p-4 pb-20">
      <BasicInfoEditSection model={model} />
      <AdditionalInfoSection model={model} />
    </Container>
  );
}, AccessType.updateModel);

export default EditModelPage;
