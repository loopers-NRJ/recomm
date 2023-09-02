"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FC } from "react";
import { Brand, Model, Wish, WishStatus } from "@prisma/client";

type WishProp = Wish & {
  model: Model & {
    brand: Brand;
  };
};

interface WishCardProps {
  wish: WishProp;
}

const WishCard: FC<WishCardProps> = ({ wish }) => {
  const model = wish.model.name;
  const brand = wish.model.brand.name;
  const status = wish.status;

  return (
    <Card className="flex w-[350px] items-center justify-between md:w-[500px]">
      <div className="flex flex-col gap-0">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {brand} {model}
          </CardTitle>
          <CardDescription>{"Electronics"}</CardDescription>
          <Badge
            className="leading-0 w-fit select-none px-2 text-[10px]"
            variant={status}
          >
            {status}
          </Badge>
        </CardHeader>
      </div>
      <CardFooter className="flex-col items-end gap-2 p-6">
        <Button disabled={status !== WishStatus.available}>
          View Products
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishCard;
