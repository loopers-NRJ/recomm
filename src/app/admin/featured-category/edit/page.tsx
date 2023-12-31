import AdminPage from "@/hoc/AdminPage";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import EditFeaturedCategory from "./EditFeatured";

const EditFeaturedCategoryPage = AdminPage<undefined, { id?: string }>(
  async (props) => {
    const { id } = props.searchParams;
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
  },
);

export default EditFeaturedCategoryPage;
