"use client";

import { useRouter } from "next/navigation";
import { type FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { WishStatus } from "@prisma/client";
import { type WishPayloadIncluded } from "@/types/prisma";

interface WishCardProps {
  wish: WishPayloadIncluded;
}

const WishCard: FC<WishCardProps> = ({ wish }) => {
  const category = wish.category?.name;
  const model = wish.model?.name;
  const brand = wish.brand?.name;
  const status = wish.status;
  const deleteWish = api.wish.delete.useMutation();
  const handleDelete = (id: string) => {
    deleteWish.mutate({
      wishId: id,
    });
  };

  const router = useRouter();

  return (
    <Card className="flex w-full items-center justify-between md:w-[500px]">
      <div className="flex flex-col gap-0">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Category: {category}
            Brand: {brand}
            Model: {model}
          </CardTitle>
          <CardDescription>{"Electronics"}</CardDescription>
          <Badge
            className="leading-0 w-fit select-none px-2 text-[10px]"
            variant={
              status === WishStatus.available ? "default" : "destructive"
            }
          >
            {status}
          </Badge>
        </CardHeader>
      </div>
      <CardFooter className="flex-col items-end gap-2 p-6">
        <Button
          onClick={() => router.push(`/products?category=${wish.model?.name}`)}
          disabled={status !== WishStatus.available}
        >
          View
        </Button>
        <Button onClick={() => handleDelete(wish.id)} variant={"destructive"}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishCard;
