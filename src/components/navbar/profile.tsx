import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";

const Profile = ({ session }: { session: Session | null }) => {
  return (
    <Link
      href={session ? `/user/${session.user.id}/profile` : "/login"}
      className="rounded-full w-fit h-full hover:bg-slate-100/10"
    >
      <Image
        className="rounded-full w-full h-full"
        height={30}
        width={30}
        alt="Avatar"
        src={session?.user.image ?? "/avatar.svg"}
      />
    </Link>
  );
};

export default Profile;
