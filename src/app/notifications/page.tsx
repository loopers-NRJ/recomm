import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import Container from '@/components/Container';
import { api } from '@/trpc/server';
import List from "./list"

const NotificationPage = AuthenticatedPage(async () => {
  const { notifications } = await api.inbox.all.query({});

  return <Container className="mb-32">
    <main className="flex justify-center items-center font-medium text-sm">
      <List notifications={notifications} />
    </main>
  </Container>;
},
  "/notifications"
)

export default NotificationPage;
