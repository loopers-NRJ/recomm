import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditModel from "./EditModel";

const EditModelPage = AdminPage<{ id: string }>(async (props) => {
  const { id } = props.params;
  const model = await api.model.getModelById.query({ modelId: id });

  if (!model) {
    return notFound();
  }

  return <EditModel model={model} />;
});

export default EditModelPage;
