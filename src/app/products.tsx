"use client";

import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useClientselectedCity } from "@/store/ClientSelectedCity";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { useLayoutEffect } from "react";

export default function Products() {
  const city = useClientselectedCity((selected) => selected.city?.value);

  useLayoutEffect(() => {
    if (!city) {
      // TODO: @iam-naveen redirect to city selecting page.
    }
  }, [city]);

  const productQuery = api.product.all.useQuery({ city });

  if (productQuery.isLoading) {
    return <LoadingProducts />;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.5, staggerChildren: 0.03 },
        },
      }}
      initial="hidden"
      animate="show"
      className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
    >
      {productQuery.data?.products.map((product) => {
        return <ListingCard key={product.id} product={product} />;
      })}
    </motion.div>
  );
}

export function AdCard() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 3000 })]}
      className="mb-5 overflow-hidden rounded-xl sm:hidden"
    >
      <CarouselContent>
        <CarouselItem className="overflow-hidden rounded-xl">
          <Image
            width={400}
            height={100}
            src="/ad/mobile.jpg"
            alt="ad1"
            className="object-cover"
          />
        </CarouselItem>
        <CarouselItem className="overflow-hidden rounded-xl">
          <Image
            width={400}
            height={100}
            src="/ad/bike.jpg"
            alt="ad1"
            className="object-cover"
          />
        </CarouselItem>
        <CarouselItem className="overflow-hidden rounded-xl">
          <Image
            width={400}
            height={100}
            src="/ad/car.jpg"
            alt="ad1"
            className="object-cover"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
