import Container from "@/components/Container";
// import AuthenticatedPage from "@/hoc/AuthenticatedPage";

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
// export default AuthenticatedPage(NotificationPage);
export default NotificationPage;
