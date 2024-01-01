import AdminPage from "@/hoc/AdminPage";
import EditBrand from "./EditBrand";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";

const EditBrandPage = AdminPage<{ id: string }>(async (props) => {
  const { id } = props.params;
  
  const brand = await api.brand.getBrandById.query({ brandId: id });
  if (!brand) {
    return notFound();
  }
  return <EditBrand brand={brand} />;
});

export default EditBrandPage;
