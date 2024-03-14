import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import Container from "@/components/Container";
import AddressList from "@/components/common/AddressList";
import AddAddressButton from "./add-address";

const UpdatePage = AuthenticatedPage(async ({ params, session }) => {
  const { userId } = params;
  if (session.user.id !== userId) {
    return <div>Unauthorized</div>;
  }

  return (
    <Container>
      <AddAddressButton />
      <AddressList enableUpdate enableDeleting />
    </Container>
  );
});

export default UpdatePage;
