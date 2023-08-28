import Container from "@/components/Container";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
// import { api } from "@/utils/api";
import Heading from "@/components/Heading";
import Image from "next/image";
import HeartButton from "@/components/HeartButton";
import Avatar from "@/components/navbar/Avatar";
import Button from "@/components/Button";
import { GiSofa } from "react-icons/gi";
import BiddingList from "@/components/BiddingList";
import { api } from "@/utils/api";
import { NextPage } from "next";
import ListingCategory from "@/components/ListingCategory";

const ProductPage: NextPage = () => {
  const router = useRouter();
  const productId = router.query.productId! as string;
  const { data: session } = useSession();

  const { data: product, isLoading } = api.product.getProductById.useQuery({
    productId,
  })!;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!product || product === undefined || product instanceof Error) {
    return <div>Product not found</div>;
  }

  return (
    <Container>
      <div className="mx-auto max-w-screen-lg">
        <div className="flex flex-col gap-6">
          <Heading title={product.model.name} subtitle={product.description} />

          <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
            <Image
              src="/shoe.jpg"
              fill
              className="w-full object-cover"
              alt="Image"
            />
            <div className="absolute right-5 top-5">
              <HeartButton productId={product.id} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-7 md:gap-10">
            {/* Info */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <div className="text-xlfont-semibold flex flex-row items-center gap-2">
                  <div>Posted by {session?.user.name}</div>
                  <Avatar src={session?.user.image} />
                </div>
                <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
                  <div>{session?.user.email}</div>
                </div>
              </div>
              <hr />
              <ListingCategory icon={GiSofa} label={"Furniture"} />
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
            <div className=" order-first mb-10 md:order-last md:col-span-3 ">
              <div className="border-[1px]border-neutral-200 overflow-hidden rounded-xl bg-white">
                <div className="flex flex-row items-center gap-1 p-4">
                  <div className="text-2xl font-semibold">
                    Rs. {product.price}
                  </div>
                </div>
                <hr />
                <div className="flex flex-row items-center justify-between p-4 text-lg font-semibold">
                  <div>Highest Bid</div>
                  <div>{product.room.highestBid?.price}</div>
                </div>
                <hr />
                <BiddingList product={product}></BiddingList>
                <hr />
                <div className="p-4">
                  <Button
                    disabled={false}
                    label="Place Bid"
                    onClick={() => {
                      console.log("Place Bid clicked");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
export default ProductPage;
