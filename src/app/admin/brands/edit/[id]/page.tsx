import AdminPage from "@/hoc/AdminPage";
import EditBrand from "./EditBrand";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";

const EditBrandPage = AdminPage<{ id: string }>(async (props) => {
  const { id } = props.params;

  const brand = await api.brand.byId.query({ brandId: id });
  if (brand === "Brand not found") {
    return notFound();
  }
  return <EditBrand brand={brand} />;
}, AccessType.updateBrand);

export default EditBrandPage;
