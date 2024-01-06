import { type AppRouter } from "@/server/api/root";
import { type TRPCClientErrorLike } from "@trpc/client";
import toast from "react-hot-toast";

export function errorHandler(error: TRPCClientErrorLike<AppRouter>) {
  if (error.data) {
    if (error.data.code === "BAD_REQUEST" && error.data.zodError) {
      for (const [, errorMessages] of Object.entries(
        error.data.zodError.fieldErrors,
      )) {
        toast.error(errorMessages?.[0] ?? "Oops! Invalid data.");
      }
    } else if (error.data.code === "TOO_MANY_REQUESTS") {
      toast.error(
        "Too many requests. Slow down and give the server a breather.",
      );
    } else {
      toast.error(
        "Oops, something went wrong on our end. Our tech team is on it.",
      );
    }
  } else {
    toast.error(
      "Oops, something went wrong on our end. Our tech team is on it.",
    );
  }
}
