"use client";

import { Skeleton } from "../ui/skeleton";

const LoadingCategories = () => {
  const dummy = new Array(10).fill(0);

  return (
    <div className="inline w-full overflow-x-scroll whitespace-nowrap md:flex md:flex-row md:justify-between">
      {dummy.map((_, i) => (
        <Skeleton
          key={i}
          className="mx-3 mt-4 inline-block h-16 w-16 bg-slate-400/20 p-6 md:h-20 md:w-24"
        ></Skeleton>
      ))}
    </div>
  );
};
export default LoadingCategories;
