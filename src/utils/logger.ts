import { type PrismaClient } from "@prisma/client";

export type LogLevel = "info" | "warn" | "error";
export type Logger = Record<
  LogLevel,
  (message: string, detail?: unknown) => Promise<void>
>;

export function getLogger(db: PrismaClient): Logger {
  const addLogToDB = async (
    level: LogLevel,
    message: string,
    detail?: unknown,
  ) => {
    await db.log.create({
      data: {
        level,
        message,
        detail: JSON.stringify(detail),
      },
    });
  };
  return {
    info: (message, detail) => addLogToDB("info", message, detail),
    warn: (message, detail) => addLogToDB("warn", message, detail),
    error: (message, detail) => addLogToDB("error", message, detail),
  };
}
