import Container from "@/components/Container";
import { AdminButtonLink } from "@/components/common/ButtonLink";

/**
 * this page is responsible for handling 404 errors
 * renders a generic error message
 */
export default function NativeNotFoundPage() {
  return (
    <Container className="flex min-h-[80svh] items-center justify-center">
      <div>
        <h1 className="mb-4 tracking-tight">
          Oops! Looks like we hit a digital dead end. Fear not, <b>Recomm</b> is
          ready to guide you back.
        </h1>
        <AdminButtonLink href="/" variant="outline">
          Get back to Home page
        </AdminButtonLink>
      </div>
    </Container>
  );
}
