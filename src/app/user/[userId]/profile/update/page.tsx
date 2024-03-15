import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import Container from "@/components/Container";
import { api } from "@/trpc/server";
import ProfileEditArea from "./profile-edit";
import ContactEditArea from "./contact-edit";
import AddressEditArea from "./address-edit";

const UpdatePage = AuthenticatedPage(async ({ params, session }) => {
  const { userId } = params;
  if (session.user.id !== userId) {
    return <div>Unauthorized</div>;
  }

  const user = await api.user.byId.query({ userId });
  if (!user || typeof user === "string") {
    return <div>User not found</div>;
  }

  return (
    <Container>
      <ProfileEditArea user={user} />
      <ContactEditArea user={user} />
      <AddressEditArea />
    </Container>
  );
});

export default UpdatePage;
