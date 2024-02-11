import AdminPage from "@/hoc/AdminPage";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import EditFeaturedCategory from "./EditFeatured";
import { AccessType } from "@prisma/client";

const EditFeaturedCategoryPage = AdminPage<{ id: string }>(async (props) => {
  const { id } = props.params;
  if (!id) {
    return redirect("/admin/tables/featured-category");
  }

  const category = await prisma.featuredCategory.findUnique({
    where: {
      categoryId: id,
    },
    select: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      image: true,
    },
  });
  if (!category) {
    return notFound();
  }

  return <EditFeaturedCategory category={category} />;
}, AccessType.updateCategory);

export default EditFeaturedCategoryPage;
