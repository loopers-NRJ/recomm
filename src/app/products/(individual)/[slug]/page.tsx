import { api } from "@/trpc/server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Container from "@/components/Container";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ViewBidsButton from "../_components/ViewBidsButton";
import BiddingButton from "../_components/BiddingButton";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Interactions from "../_components/Interactions";
import ReportButton from "../_components/ReportButton";

function lastSeen(lastActive: Date | null) {
  if (!lastActive) {
    return "Last seen just now";
  }
  const diff = Date.now() - lastActive.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return "Last seen just now";
  } else if (minutes < 60) {
    return `Last seen ${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Last seen ${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  return `Last seen ${days} days ago`;
}

interface ProductPageParams {
  slug: string;
}

async function ProductPage({ params }: { params: ProductPageParams }) {
  const session = await getServerAuthSession();
  const product = await api.product.bySlug.query({ productSlug: params.slug });
  const fav = await api.user.favorites.query({}).then((res) => res.favoritedProducts.find((fav) => fav.id === product.id))

  return (
    <>
      <Carousel opts={{ loop: true }} className="min-w-xs w-full">
        <CarouselContent>
          {product.images?.map((image, i) => (
            <CarouselItem key={i} className="pl-0">
              <Image
                src={image.url}
                width={500}
                height={400}
                className="h-auto w-full"
                alt="Product Image"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
      <Container className="pb-20">
        <div className="my-3 flex items-center justify-between">
          <h1 className="price text-2xl font-bold">₹{product.price}</h1>
          <Interactions product={product} liked={fav!=undefined} />
        </div>
        <div className="my-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-medium">{product.title}</h2>
            <span className="text-sm text-gray-500">seller area</span> .{" "}
            <span className="text-sm text-gray-500">
              {product.createdAt.toLocaleDateString()}
            </span>
          </div>
          {session && session.user ? (
            session.user.id === product.seller.id ? (
              <ViewBidsButton bids={product.room.bids} />
            ) : (
              <BiddingButton
                roomId={product.room.id}
                bids={product.room.bids}
              />
            )
          ) : (
            <Button
              className="bg-sky-400 font-bold text-white hover:bg-sky-500"
              variant="link"
              size="lg"
              asChild
            >
              <Link href="/login">Login to Place a Bid</Link>
            </Button>
          )}
        </div>
        <Separator />
        <div className="my-5">
          <h3 className="font-bold">Description</h3>
          <p>{product.description}</p>
        </div>
        <Separator />
        <Accordion type="single" collapsible className="my-5">
          <h3 className="font-bold">Details</h3>
          {product.selectedChoices.map((choice, i) => {
            return (
              <AccordionItem value={choice.id} key={i}>
                <AccordionTrigger>
                  {choice.question.questionContent}
                </AccordionTrigger>
                <AccordionContent>{choice.value}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <div className="flex justify-between">
          <Link
            className="flex items-center space-x-4"
            href={`/user/${product.seller.id}/profile`}
          >
            <Avatar>
              <AvatarImage src={product.seller.image ?? undefined} />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {product.seller.name}
              </p>
              <p className="text-muted-foreground text-sm">
                {lastSeen(product.seller.lastActive)}
              </p>
            </div>
          </Link>
          <ReportButton id={product.id}/>
        </div>
      </Container>
    </>
  );
}
export default ProductPage;
