import Categories from "./Categories";
import Container from "@/components/Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import { useSession } from "next-auth/react";
import { type User } from "next-auth";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const isMainPage = useRouter().pathname === "/";

  return (
    <div className="fixed z-10 w-full bg-white shadow-sm">
      <div
        className="
          border-b-[1px] 
          py-4
        "
      >
        <Container>
          <div
            className="
            flex 
            flex-row 
            items-center 
            justify-between
            gap-3
            md:gap-0
          "
          >
            <Logo />
            <Search />
            <UserMenu currentUser={currentUser as User} />
          </div>
        </Container>
        {isMainPage && <Categories />}
      </div>
    </div>
  );
};

export default Navbar;
