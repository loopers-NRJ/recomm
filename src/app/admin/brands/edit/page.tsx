import AdminPage from "@/hoc/AdminPage";
import EditBrand from "./EditBrand";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";

const EditBrandPage = AdminPage<undefined, { id?: string }>(async (props) => {
  const { id } = props.searchParams;
  if (!id) {
    return notFound();
  }
  const brand = await api.brand.getBrandById.query({ brandId: id });
  if (!brand) {
    return notFound();
  }
  return <EditBrand brand={brand} />;
});

export default EditBrandPage;
