import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Container from "@/components/Container";
import Search from "@/components/search/Search";

import Categories from "./Categories";
import Logo from "./Logo";
import NavItems from "./NavItems";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const isMainPage = useRouter().pathname === "/";

  return (
    <div className="fixed left-0 top-0 z-10 w-full bg-white shadow-sm">
      <div className="border-b-[1px] py-4">
        <Container>
          <div className="flex items-center justify-between pt-3">
            <div className="flex w-full items-center justify-between md:justify-start md:gap-5">
              <Logo />
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
