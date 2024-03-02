"use client";

import HeartUI from "@/components/heart";
import { refreshFavs } from "@/server/actions";
import { api } from "@/trpc/react";
import type { ProductsPayloadIncluded } from "@/types/prisma";
import { MapPin, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

function Interactions({ product, liked }: { product: ProductsPayloadIncluded, liked: boolean }) {
  const { mutate: add } = api.product.addToFavorites.useMutation();
  const { mutate: remove } = api.product.removeFromFavorites.useMutation();

  const [isFav, setIsFav] = useState(liked);

  const toggle = async () => {
    if (isFav) remove({ productId: product.id });
    else add({ productId: product.id });
    setIsFav(!isFav);
    await refreshFavs();
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
      {/*  -------- RIZWAN's NUMBER :) ---- */}
      <Link href={`https://wa.me/7397379958`}>
        <MessageCircle />
      </Link>
      <MapPin />
      <div className="relative w-5" onClick={toggle}>
        <HeartUI clicked={isFav.toString()} className="translate-x-1/2 -translate-y-1/2" />
      </div>
      <div onClick={share}><Share2 /></div>
    </ul>
  );
}

export default Interactions;
