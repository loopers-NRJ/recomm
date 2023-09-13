import Container from "../Container";
import { Skeleton } from "../ui/skeleton";

const LoadingProducts = () => {
  const dummy = new Array(20).fill(0);

  return (
    <main>
      <Container>
        <div
          className="
            grid 
            grid-cols-1 
            gap-8
            sm:grid-cols-2 
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-4
            2xl:grid-cols-6
          "
        >
          {dummy.map((_, i) => (
            <Skeleton
              key={i}
              className="group col-span-1 h-60 w-full bg-slate-400/20"
            />
          ))}
        </div>
      </Container>
    </main>
  );
};
export default LoadingProducts;
