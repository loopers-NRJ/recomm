import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import {
  type ProductsPayloadIncluded,
  hasAdminPageAccess,
  productsPayload,
} from "@/types/prisma";
import { notFound } from "next/navigation";
import { Workbook } from "exceljs";
import { prisma } from "@/server/db";

async function GenerateExcel(products: ProductsPayloadIncluded[]) {
  const sheet = new Workbook();
  const worksheet = sheet.addWorksheet("Logs");

  worksheet.columns = [
    { header: "id", key: "id" },
    { header: "title", key: "title" },
    { header: "description", key: "description" },
    { header: "price", key: "price" },
    { header: "category", key: "category" },
    { header: "brand", key: "brand" },
    { header: "model", key: "model" },
    { header: "City", key: "city" },
    { header: "sellerName", key: "sellerName" },
    { header: "sellerEmail", key: "sellerEmail" },
    { header: "sellerMobile", key: "sellerMobile" },
    { header: "pricePaid", key: "pricePaid" },
    { header: "images", key: "images" },
    { header: "active", key: "active" },
    { header: "isDeleted", key: "isDeleted" },
    { header: "couponCode", key: "couponCode" },
    { header: "createdAt", key: "createdAt" },
    { header: "updatedAt", key: "updatedAt" },
  ];

  for (const product of products) {
    worksheet.addRow({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images.map((image) => image.secureUrl).join("\n"),
      sellerName: product.seller.name,
      sellerEmail: product.seller.email,
      sellerMobile: product.seller.mobile,
      model: product.model.name,
      city: product.model.cityValue,
      category: product.model.category.name,
      pricePaid: product.model.category.price,
      brand: product.model.brand.name,
      active: product.active,
      isDeleted: product.isDeleted,
      couponCode: product.couponCode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  return sheet;
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    notFound();
  }
  if (!session.user.roleId) {
    notFound();
  }
  const role = await api.role.byId.query({ id: session.user.roleId });
  const accesses = role?.accesses.map((access) => access.type);
  if (!hasAdminPageAccess(accesses)) {
    notFound();
  }

  const products = await prisma.product.findMany({
    include: productsPayload.include,
  });

  const sheet = await GenerateExcel(products);

  return new Response(await sheet.xlsx.writeBuffer(), {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": "attachment; filename=logs.xlsx",
    },
  });
}
