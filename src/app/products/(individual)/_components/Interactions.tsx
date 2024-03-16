"use client";

import HeartButton from "@/components/heart/HeartButton";
import { api } from "@/trpc/react";
import type { ProductsPayloadIncluded } from "@/types/prisma";
import { MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import MapInteraction from "./MapInteraction";

function Interactions(
  { 
    os,
    product,
    liked
  }: {
    os: string | null,
    product: ProductsPayloadIncluded,
    liked: boolean
  }) {
  const { mutate: add } = api.product.addToFavorites.useMutation();
  const { mutate: remove } = api.product.removeFromFavorites.useMutation();

  const [isFav, setIsFav] = useState(liked);

  const toggle = async () => {
    if (isFav) remove({ productId: product.id });
    else add({ productId: product.id });
    setIsFav(!isFav);
  };

  const share = async () => {
    try {
      await navigator.share({
        title: "Check out this product on RECOMM",
        text: product.title,
        url: `https://recomm.in/products/${product.slug}`,
      });
    } catch (err) {
      try {
        await navigator.clipboard.writeText(`https://recomm.in/products/${product.slug}`);
        toast.success("Link copied");
      } catch (err) {
        toast.error("Failed to copy link");
        console.log(product);
        console.error(err);
      }
    }
  }

  return (
    <ul className="interactions flex gap-3">
      <Link target="_blank" rel="noopener" href={`https://wa.me/${product.seller.mobile}`}>
        <MessageCircle />
      </Link>
      <MapInteraction os={os} product={product} />
      <div className="relative flex items-center justify-center w-6">
        <HeartButton onClick={toggle} starred={isFav} />
      </div>
      <div onClick={share}><Share2 /></div>
    </ul>
  );
}

export default Interactions;
