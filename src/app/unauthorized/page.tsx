import Container from "@/components/Container";
import { ButtonLink } from "@/components/common/ButtonLink";

export default function Unauthorized() {
  return (
    <Container className="flex min-h-[80svh] items-center justify-center">
      <div>
        <h1 className="mb-4 tracking-tight">
          Oops! Unauthorized access. Seek proper clearance
        </h1>
        <ButtonLink href="/" variant="outline">
          Get back to Home page
        </ButtonLink>
      </div>
    </Container>
  );
}
