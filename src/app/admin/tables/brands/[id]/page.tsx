import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

const ViewBrandDetailsPage = AdminPage<{ id: string }>(
  async (props) => {
    const { id } = props.params;
    const brand = await api.brand.byId.query({ brandId: id });
    if (brand === "Brand not found") {
      return notFound();
    }
    return (
      <div>
        <nav>
          <Link
            href="/admin/tables/brands"
            className="text-blue-400 hover:text-blue-600"
          >
            Brands
          </Link>
          <span className="mx-2">{"/"}</span>
          <span>{brand.name}</span>
        </nav>

        {/* TODO: display the brand image here */}
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Brand Name</div>
            <div>{brand.name}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Created At</div>
            <div>{brand.createdAt.toLocaleString("en-US")}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Updated At</div>
            <div>{brand.updatedAt.toLocaleString("en-US")}</div>
          </div>
        </div>
      </div>
    );
  },
  (accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.createBrand ||
        access === AccessType.updateBrand ||
        access === AccessType.deleteBrand,
    ),
);

export default ViewBrandDetailsPage;
