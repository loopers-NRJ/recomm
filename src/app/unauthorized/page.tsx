import Container from "@/components/Container";
import { AdminButtonLink } from "@/components/common/ButtonLink";

export default function Unauthorized() {
  return (
    <Container className="flex min-h-[80svh] items-center justify-center">
      <div>
        <h1 className="mb-4 tracking-tight">
          Oops! Unauthorized access. Seek proper clearance
        </h1>
        <AdminButtonLink href="/" variant="outline">
          Get back to Home page
        </AdminButtonLink>
      </div>
    </Container>
  );
}
