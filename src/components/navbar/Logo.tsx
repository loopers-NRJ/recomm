import Image from "next/image";
import Link from "next/link";
import RecommLogo from "@/../public/recomm.png";

const Logo = () => {
  return (
    <Link href="/">
      <Image
        className="w-full cursor-pointer"
        src={RecommLogo}
        height="33"
        width="130"
        alt="Logo"
        priority
      />
    </Link>
  );
};

export default Logo;
