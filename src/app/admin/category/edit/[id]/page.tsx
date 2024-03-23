import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditCategory from "./EditCategory";
import { AccessType } from "@prisma/client";

const EditCategoryPage = AdminPage<{ id: string }>(async (props) => {
  const categoryId = props.params.id;
  const category = await api.category.byId.query({ categoryId });
  const variants = await api.variant.allByCategoryId.query({ categoryId });

  if (!category || category === "Category not found") {
    return notFound();
  }
  return <EditCategory category={category} variants={variants} />;
}, AccessType.updateCategory);

export default EditCategoryPage;
