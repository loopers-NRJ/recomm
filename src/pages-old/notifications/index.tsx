import Container from "@/components/Container";
import { withProtectedRoute } from "@/hoc/ProtectedRoute";

export const getServerSideProps = withProtectedRoute();

function NotificationPage() {
  return (
    <main>
      <Container>
        <div className="flex h-[500px] items-center justify-center font-semibold">
          No Notifications...
        </div>
      </Container>
    </main>
  );
}
export default NotificationPage;
