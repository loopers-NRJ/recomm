import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, size }) => {
  return (
    <Image
      className="rounded-full"
      height={size ?? "30"}
      width={size ?? "30"}
      alt="Avatar"
      src={src ?? "/placeholder.jpg"}
    />
  );
};

export default Avatar;
