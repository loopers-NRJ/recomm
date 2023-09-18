import Container from "@/components/Container";
import { NextPage } from "next";
import Image from "next/image";

const NotFound: NextPage = () => {
  return (
    <Container>
      <main className="flex h-[400px] w-full flex-col items-center justify-center gap-5">
        <Image
          alt="404 not found"
          src="/404.svg"
          width={300}
          height={300}
        ></Image>
        <span className="font-semibold">Page Not Found</span>
      </main>
    </Container>
  );
};

export default NotFound;
