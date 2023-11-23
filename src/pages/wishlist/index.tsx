import { NextPage } from "next";

import AddWish from "@/components/AddWish";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Wishes from "@/components/Wishes";

const WishList: NextPage = () => {
  return (
    <Container>
      <div className="mt-5 flex justify-between">
        <Heading title="Your WishList"></Heading>
        <AddWish />
      </div>
      <Wishes />
    </Container>
  );
};

export default WishList;
