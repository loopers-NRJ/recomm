import { type FC } from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingProductsProps {
  className?: string;
}

const LoadingProducts: FC<LoadingProductsProps> = ({ className }) => {
  const dummy = new Array(20).fill(0);

  return (
    <div
      className={cn(
        className,
        "grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6",
      )}
    >
      {dummy.map((_, i) => (
        <Skeleton key={i} className="group h-52 w-full bg-slate-400/20" />
      ))}
    </div>
  );
};
export default LoadingProducts;
