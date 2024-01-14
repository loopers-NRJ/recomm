import Image from "next/image";
import { AvatarIcon } from "./Icons";

interface AvatarProps {
  src: string | null | undefined;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, size }) => {
  if (src) {
    return (
      <Image
        className="rounded-full"
        height={size ?? "30"}
        width={size ?? "30"}
        alt="Avatar"
        src={src}
      />
    );
  } else {
    return <AvatarIcon />;
  }
};

export default Avatar;
