import type { PrismaClient } from "@prisma/client";

export const logLevel = ["info", "warn", "error"] as const;
export type LogLevel = (typeof logLevel)[number];
type LoggerProps = {
  message: string;
  detail?: unknown;
  city?: string;
};
export type Logger = Record<LogLevel, (props: LoggerProps) => Promise<void>>;

export function getLogger(db: PrismaClient): Logger {
  const addLogToDB = async (level: LogLevel, props: LoggerProps) => {
    console[level](props.city, props.message, props.detail);
    await db.log.create({
      data: {
        level: level,
        message: props.message,
        detail: JSON.stringify(props.detail),
        cityValue: !props.city ? null : props.city,
      },
    });
  };
  return {
    info: (props) => addLogToDB("info", props),
    warn: (props) => addLogToDB("warn", props),
    error: (props) => addLogToDB("error", props),
  };
}
