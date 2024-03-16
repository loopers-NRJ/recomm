import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import Container from '@/components/Container';
import { api } from '@/trpc/server';
import List from "./list"

const NotificationPage = AuthenticatedPage(async () => {
  const { notifications } = await api.inbox.all.query({});

  if (notifications.length == 0) {
    return <Container>
      <main className="flex justify-center items-center font-medium text-sm h-52">
        No Notifications...
      </main>
    </Container>;
  }

  return <Container>
    <main className="flex justify-center items-center font-medium text-sm">
      <List notifications={notifications} />
    </main>
  </Container>;
},
  "/notifications"
)

export default NotificationPage;
