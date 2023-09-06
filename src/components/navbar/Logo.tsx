"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <Image
      onClick={() => router.push("/")}
      className="cursor-pointer"
      src="/recomm.png"
      height="130"
      width="130"
      alt="Logo"
    />
  );
};

export default Logo;
