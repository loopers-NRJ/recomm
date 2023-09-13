"use client";

import Container from "../Container";
import { Skeleton } from "../ui/skeleton";

const LoadingCategories = () => {
  const dummy = new Array(10).fill(0);

  return (
    <Container>
      <div className="flex flex-row items-center justify-between overflow-x-auto pt-4">
        {dummy.map((_, i) => (
          <Skeleton
            key={i}
            className="h-16 w-16 bg-slate-400/20 p-3"
          ></Skeleton>
        ))}
      </div>
    </Container>
  );
};
export default LoadingCategories;
