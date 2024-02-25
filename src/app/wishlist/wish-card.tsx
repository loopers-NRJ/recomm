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
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

interface WishCardProps {
  wish: WishPayloadIncluded;
}

const WishCard: FC<WishCardProps> = ({ wish }) => {
  const category = wish.category?.name;
  const model = wish.model?.name;
  const brand = wish.brand?.name;
  const status = wish.status;
  const { mutateAsync: deleteWish, isLoading } = api.wish.delete.useMutation();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteWish({
      wishId: id,
    });
    router.refresh();
  };

  return (
    <Card className="flex justify-between items-center">
        <CardHeader className="p-4">
          <CardTitle className="font-semibold text-xl">
            {brand} {model}
          </CardTitle>
          <CardDescription>
          <Badge variant={status===WishStatus.available ? "destructive" : "secondary"}>{status}</Badge>
          {category}
          </CardDescription>
        </CardHeader>
      <CardFooter className="p-4 gap-2">
        <Button 
          disabled={status !== WishStatus.available} 
          variant="default" size="sm" 
          className="w-full disabled:text-muted-foreground disabled:bg-muted disabled:border-2"
        >
           {/* TODO: redirect to exact product group */} 
          <Link href={`/products?category=${wish.model?.name}`}> View </Link>
        </Button>
        <Button 
          onClick={() => handleDelete(wish.id)} 
          size="sm" variant={"destructive"} 
          className="w-full"
        >
          { isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" /> }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishCard;
