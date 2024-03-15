import { type FC } from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingProductsProps {
  className?: string;
}

const LoadingProducts: FC<LoadingProductsProps> = ({ className }) => {
  const dummy = new Array(10).fill(0);

  return (
    <div
      className={cn(
        className,
        "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6",
      )}
    >
      {dummy.map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <Skeleton className="group h-44 w-full bg-slate-400/20" />
          <Skeleton className="w-[90%] h-6 bg-slate-400/20" />
          <Skeleton className="w-3/4 h-5 bg-slate-400/20" />
        </div>
      ))}
    </div>
  );
};
export default LoadingProducts;
