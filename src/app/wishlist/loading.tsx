import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <Container>
      <header className="mt-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your WishList</h1>
        <Button disabled size="sm">Create a Wish</Button>
      </header>
    <main className="mt-10 space-y-3">
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
      <Skeleton className="animate-pulse bg-gray-200 rounded-md w-full h-24" ></Skeleton>
    </main>
  </Container>
}
