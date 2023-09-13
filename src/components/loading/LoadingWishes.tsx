import { Skeleton } from "../ui/skeleton";

const LoadingWishes = () => {
  const dummy = new Array(10).fill(0);

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-5">
      <div className="list w-full space-y-3">
        {dummy.map((_, i) => (
          <Skeleton key={i} className="h-32 w-[350px] md:w-[500px]" />
        ))}
      </div>
    </div>
  );
};
export default LoadingWishes;
