import { api } from "@/trpc/server";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HeartIcon, MapPin, MessageCircle, Share2, UserIcon } from "lucide-react";
import Image from 'next/image'
import Container from "@/components/Container";
import { Accordion, AccordionContent, AccordionTrigger, AccordionItem } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ViewBidsButton from "../_components/ViewBidsButton";
import BiddingButton from "../_components/BiddingButton";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function lastSeen(lastActive: Date | null) {
  if (!lastActive) {
    return "Last seen just now";
  }
  const diff = Date.now() - lastActive.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return "Last seen just now";
  }
  else if (minutes < 60) {
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

  return <>
    <Carousel opts={{loop: true}} className="w-full min-w-xs">
      <CarouselContent>
        {product.images?.map((image, i) => (
          <CarouselItem key={i} className="pl-0">
            <Image src={image.url} width={500} height={400} className="w-full h-auto" alt="Product Image" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0"/>
    </Carousel>
    <Container className="pb-20">
      <div className="flex justify-between items-center my-3">
        <h1 className="price text-2xl font-bold">₹{product.price}</h1>
        <ul className="interactions flex gap-3">
          <MessageCircle />
          <MapPin />
          <HeartIcon />
          <Share2 />
        </ul>
      </div>
      <div className="flex justify-between items-end my-5">
        <div>
          <h2 className="text-2xl font-medium">{product.title}</h2>
          <span className="text-sm text-gray-500">seller area</span>
          {" "}.{" "}
          <span className="text-sm text-gray-500">{product.createdAt.toLocaleDateString()}</span>
        </div>
        {session && session.user ?
          session.user.id === product.seller.id ?
          <ViewBidsButton bids={product.room.bids}/> : 
          <BiddingButton roomId={product.room.id} bids={product.room.bids} /> :
          <Button className="bg-sky-400 hover:bg-sky-500 font-bold text-white" variant="link" size="lg" asChild>
            <Link href="/login">Login to Place a Bid</Link>
          </Button>}
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
          return <AccordionItem value={choice.id} key={i}>
            <AccordionTrigger>{choice.question.questionContent}</AccordionTrigger>
            <AccordionContent>{choice.value}</AccordionContent>
          </AccordionItem>
        })}
      </Accordion>
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={product.seller.image ?? undefined} />
            <AvatarFallback><UserIcon /></AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{product.seller.name}</p>
            <p className="text-sm text-muted-foreground">{lastSeen(product.seller.lastActive)}</p>
          </div>
        </div>
        <a href="#" className="text-xs font-light text-gray-500">Report this Ad</a>
      </div>
    </Container>
  </>
}
export default ProductPage;
