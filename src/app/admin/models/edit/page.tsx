import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import EditModel from "./EditModel";

const EditModelPage = AdminPage<undefined, { id?: string }>(async (props) => {
  const id = props.searchParams.id;
  if (!id) {
    return redirect("/admin/tables/models");
  }
  const model = await api.model.getModelById.query({ modelId: id });

  if (!model) {
    return notFound();
  }

  return <EditModel model={model} />;
});

export default EditModelPage;
