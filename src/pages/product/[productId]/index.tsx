import Container from "@/components/Container";
import { useRouter } from "next/router";
import Heading from "@/components/Heading";
import HeartButton from "@/components/HeartButton";
import Avatar from "@/components/navbar/Avatar";
import Button from "@/components/Button";
import { GiSofa } from "react-icons/gi";
import BiddingList from "@/components/BiddingList";
import { api } from "@/utils/api";
import { NextPage } from "next";
import ListingCategory from "@/components/ListingCategory";
import useBiddingModal from "@/hooks/useBiddingModal";
import { useSession } from "next-auth/react";
import Carousel from "@/components/common/Carousel";

const ProductPage: NextPage = () => {
  const router = useRouter();
  const productId = router.query.productId! as string;
  const session = useSession();
  const user = session.data?.user;

  const biddingModal = useBiddingModal();

  const { data: product, isLoading } = api.product.getProductById.useQuery({
    productId,
  })!;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (product == null || product instanceof Error) {
    return <div>Product not found</div>;
  }

  return (
    <Container>
      <div className="mx-auto max-w-screen-lg">
        <div className="flex flex-col gap-6">
          <Heading title={product.model.name} />

          <div className="relative h-72 w-full overflow-hidden rounded-xl">
            <Carousel images={["/shoe.jpg"]} />
            <div className="absolute right-5 top-5">
              <HeartButton productId={product.id} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-7 md:gap-10">
            {/* Info */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <div className="text-xlfont-semibold flex flex-row items-center gap-2">
                  <div>Posted by {product.seller.name}</div>
                  <Avatar src={product.seller.image} />
                </div>
                <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
                  <div>{product.description}</div>
                </div>
              </div>
              <hr />
              <ListingCategory icon={GiSofa} label="Furniture" />
              <hr />
              <div className="text-lg font-light text-neutral-500">
                Created on {product.createdAt.toDateString()}.
              </div>
              <div className="text-lg font-light text-neutral-500">
                Bidding Ends on {product.room.closedAt.toDateString()}.
              </div>
              <hr />
            </div>

            {/* Bidding List */}
            <div className="order-first mb-10 md:order-last md:col-span-3">
              <div className="overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white">
                <div className="flex flex-row items-end justify-between p-4">
                  <div className="text-lg font-semibold">Product Price: </div>
                  <div className="text-2xl font-semibold">
                    <span className="text-xs font-light">Rs. </span>
                    {product.price}
                  </div>
                </div>
                <hr />
                <div className="p-4">
                  <Button
                    disabled={!user || user?.id === product.seller.id}
                    label="Place Bid"
                    onClick={() => {
                      biddingModal.onOpen(product.roomId);
                    }}
                  />
                </div>
                <hr />
                <div className="flex flex-row items-center justify-between p-4 text-lg font-semibold">
                  <h1>Bidding List</h1>
                </div>
                <BiddingList room={product.room}></BiddingList>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
export default ProductPage;
