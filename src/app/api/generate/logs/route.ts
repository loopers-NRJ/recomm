import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { hasAdminPageAccess } from "@/types/prisma";
import { notFound } from "next/navigation";

import { Workbook } from "exceljs";
import { type Log } from "@prisma/client";
import { prisma } from "@/server/db";

async function GenerateExcel(logs: Log[]) {
  const sheet = new Workbook();
  const worksheet = sheet.addWorksheet("Logs");

  worksheet.columns = [
    { header: "Level", key: "level" },
    { header: "City", key: "city" },
    { header: "Message", key: "message" },
    { header: "Detail", key: "detail" },
    { header: "Created At", key: "createdAt" },
  ];

  for (const log of logs) {
    worksheet.addRow({
      level: log.level,
      city: log.cityValue,
      message: log.message,
      detail: log.detail,
      createdAt: log.createdAt,
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

  const logs = await prisma.log.findMany();

  const sheet = await GenerateExcel(logs);

  return new Response(await sheet.xlsx.writeBuffer(), {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": "attachment; filename=logs.xlsx",
    },
  });
}
