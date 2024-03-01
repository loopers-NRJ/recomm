import Container from "@/components/Container";
import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import DetailsForm from "./details-form";

const DetailsPage = AuthenticatedPage<undefined, { callbackUrl?: string }>(
  async ({ session, searchParams: { callbackUrl = "/" } }) => {
    return (
      <Container>
        <h1 className="mb-4 text-3xl font-bold">Complete Your Profile</h1>
        <DetailsForm userData={session.user} callbackUrl={callbackUrl} />
      </Container>
    );
  },
  "/login/details",
);

export default DetailsPage;
