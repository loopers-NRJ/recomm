import AdminPage from "@/hoc/AdminPage";
import CreateFeaturedCategory from "./CreateFeatured";
import { api } from "@/trpc/server";
import toast from "react-hot-toast";
import { notFound } from "next/navigation";

const CreateFeaturedCategoryPage = AdminPage<{ id: string }>(async (props) => {
  if (props.params.id === "new") {
    return <CreateFeaturedCategory />;
  }
  const category = await api.category.byId.query({
    categoryId: props.params.id,
  });
  if (typeof category === "string") {
    return toast.error(category);
  }
  if (!category) {
    return notFound();
  }

  return <CreateFeaturedCategory category={category} />;
});

export default CreateFeaturedCategoryPage;
