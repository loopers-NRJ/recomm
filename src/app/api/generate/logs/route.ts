import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { hasAdminPageAccess } from "@/types/prisma";
import { notFound } from "next/navigation";

import { Workbook } from "exceljs";
import { type Log } from "@prisma/client";

async function GetLogs() {
  const logs: Log[] = [];
  let cursor: string | undefined = undefined;
  const limit = 30;

  while (true) {
    const result = await api.log.all.query({ cursor, limit });
    logs.push(...result.logs);
    if (result.logs.length < limit) {
      break;
    } else {
      cursor = result.nextCursor;
    }
  }

  return logs;
}

async function GenerateExcel(logs: Log[]) {
  const sheet = new Workbook();
  const worksheet = sheet.addWorksheet("Logs");

  worksheet.columns = [
    { header: "Level", key: "level" },
    { header: "State", key: "state" },
    { header: "Message", key: "message" },
    { header: "Detail", key: "detail" },
    { header: "Created At", key: "createdAt" },
  ];

  for (const log of logs) {
    worksheet.addRow({
      level: log.level,
      state: log.state,
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

  const logs = await GetLogs();

  const sheet = await GenerateExcel(logs);

  return new Response(await sheet.xlsx.writeBuffer(), {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": "attachment; filename=logs.xlsx",
    },
  });
}
