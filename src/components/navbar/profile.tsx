import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { User2 } from "lucide-react";

const Profile = ({ session }: { session: Session | null }) => {
  return (
    <Link
      href={session ? `/user/${session.user.id}/profile` : "/login"}
      className="rounded-full hover:bg-slate-100/10"
    >
      {session?.user.image ?
      <Image
        className="rounded-full"
        height={32}
        width={32}
        alt="Avatar"
        src={session?.user.image}
      /> :
        <div className="w-8 h-8 flex items-center justify-center border rounded-full border-black" >
          <User2 strokeWidth={1}/>
        </div>}
    </Link>
  );
};

export default Profile;
