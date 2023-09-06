import Categories from "./Categories";
import Container from "@/components/Container";
import Logo from "./Logo";
import NavItems from "./NavItems";
import { useSession } from "next-auth/react";
import { type User } from "next-auth";
import { useRouter } from "next/router";
import Search from "@/components/search/Search";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user as User;
  const isMainPage = useRouter().pathname === "/";

  return (
    <div className="fixed left-0 top-0 z-10 w-full bg-white shadow-sm">
      <div className="border-b-[1px] py-4">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center justify-between py-3 md:justify-start md:gap-5">
              <Logo />
              {/* <Search /> */}
              <Search />
            </div>
            <div className="hidden md:block">
              <NavItems currentUser={currentUser} />
            </div>
          </div>
        </Container>
        {isMainPage && <Categories />}
      </div>
    </div>
  );
};

export default Navbar;
