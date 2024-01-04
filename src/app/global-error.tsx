"use client";

import Container from "@/components/Container";
import { ButtonLink } from "@/components/common/ButtonLink";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <html>
      <body>
        <Container className="flex min-h-[80svh] items-center justify-center">
          <div>
            <h1 className="mb-4 tracking-tight">
              Uh-oh! Something went wrong. We're on it, working to bring
              everything back.
            </h1>
            <Button variant="ghost" size="sm" className="mr-2" onClick={reset}>
              Try again
            </Button>
            <ButtonLink
              href="/"
              variant="ghost"
              size="sm"
              className="font-semibold"
            >
              Get back to Home page
            </ButtonLink>
          </div>
        </Container>
      </body>
    </html>
  );
}
