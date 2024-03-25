"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

type UserAuthFormType = React.ComponentProps<"div"> & {
  callbackUrl: string;
};

export function UserAuthForm({
  className,
  callbackUrl,
  ...props
}: UserAuthFormType) {
  const [googleLoading, setGoogleLoading] = React.useState<boolean>(false);
  const [emailLoading, setEmailLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>();
  async function onSubmit(event: React.SyntheticEvent) {
    setEmailLoading(true);
    event.preventDefault();
    try {
      if (!email) {
        toast.error("Please enter your email address.");
        setEmailLoading(false);
        return;
      }
      await signIn("email", { callbackUrl, email });
    } catch (error) {
      console.log(error);
    }
    setEmailLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={emailLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button disabled={emailLoading}>
            {emailLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Log In with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        onClick={async () => {
          setGoogleLoading(true);
          await signIn("google", { callbackUrl })
        }}
        variant="outline"
        type="button"
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
