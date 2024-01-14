import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      inputMode={type === "number" ? "numeric" : undefined}
      {...props}
      onKeyDown={(e) => {
        if (
          type === "number" &&
          isNaN(Number(e.key)) &&
          e.key !== "Backspace"
        ) {
          return e.preventDefault();
        }
        props.onKeyDown?.(e);
      }}
    />
  );
});
Input.displayName = "Input";

export { Input };
