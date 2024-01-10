import AddWish from "./add-wish";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import WishList from "./wish-list";
import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import type { NextPage } from "next";

const WishesPage: NextPage = () => {
    return (
        <Container>
            <div className="mt-5 flex justify-between">
                <Heading title="Your WishList"></Heading>
                <AddWish />
            </div>
            <WishList/>
        </Container>
    );
}

export default AuthenticatedPage(WishesPage);
