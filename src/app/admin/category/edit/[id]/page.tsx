import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditCategory from "../EditCategory";

const EditCategoryPage = AdminPage<{ id: string }>(async (props) => {
  const categoryId = props.params.id;
  const category = await api.category.byId.query({ categoryId });

  if (!category || category === "Category not found") {
    return notFound();
  }
  return <EditCategory category={category} />;
});

export default EditCategoryPage;
