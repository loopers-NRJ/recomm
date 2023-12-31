import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditCategory from "./EditCategory";

const EditCategoryPage = AdminPage<undefined, { id: string }>(async (props) => {
  const categoryId = props.searchParams.id;
  const category = await api.category.getCategoryById.query({ categoryId });

  if (!category) {
    return notFound();
  }
  return <EditCategory category={category} />;
});

export default EditCategoryPage;
