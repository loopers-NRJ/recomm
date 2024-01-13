import Link from "next/link";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import Image from "next/image";
import { HeartOutline, HeartSolid } from "@/components/navbar/Icons";
import FavoriteToggle from "@/components/favorite-toggle";

interface ListingCardProps {
  product: ProductsPayloadIncluded & { isFav: boolean };
  isUser: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  product,
  isUser = false,
}) => {

  return (
    <div className="relative flex w-full flex-col">
      {
        isUser ?
          <FavoriteToggle
            id={product.id}
            state={product.isFav}
            uncheckedIcon={<HeartOutline className="text-red-500" />}
            checkedIcon={<HeartSolid className="text-red-500" />} />
          :
          null
      }
      <Link
        href={`/products/${product.slug}`}
        className="group cursor-pointer"
      >
        <Image alt={product.slug} src={product.images[0]!.url} className="w-full overflow-hidden rounded-xl" width={180} height={200} />
        <span className="text-lg font-semibold">{product.model.name}</span>
        <span className="font-semibold">₹ {product.price}</span>
      </Link>
    </div>
  );
};


export default ListingCard;
