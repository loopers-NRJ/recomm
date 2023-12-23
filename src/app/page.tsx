import AuthenticatedPage from "@/hoc/AuthenticatedPage";

export default AuthenticatedPage(async ({ session }) => {
  return (
    <div>
      <h1>Hello {session.user.name}</h1>
    </div>
  );
});
