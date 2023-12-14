import Heading from "@/components/Heading";
import Button from "@/components/Button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerAuthSession } from "@/server/auth";

const GoogleIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="25"
    height="25"
    viewBox="0 0 48 48"
    className="absolute left-3"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  if (session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  } else {
    return {
      props: {},
    };
  }
};

// TODO: just moved loginModel model to a new file called LoginPage.tsx
export default function LoginPage() {
  const router = useRouter();
  const [ispageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
    return () => setIsPageLoaded(false);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-800/70 outline-none focus:outline-none">
      <div className="relative mx-auto my-6 h-full w-full md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5">
        {/* content */}
        <div
          className={`h-full transition-all duration-300 ${
            ispageLoaded ? "translate-y-0" : "translate-y-full"
          } ${ispageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="relative flex h-full w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none md:h-auto lg:h-auto">
            {/* header */}
            <div className="relative flex items-center justify-center rounded-t border-b-[1px] p-6">
              <button
                className="absolute left-9 border-0 p-1 transition hover:opacity-70"
                onClick={() => {
                  setIsPageLoaded(false);
                  void new Promise((resolve) => setTimeout(resolve, 200)).then(
                    router.back
                  );
                }}
              >
                {/* Close Icon */}
                <div className="close-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </button>
              <div className="text-lg font-semibold">Login</div>
            </div>
            {/* body */}
            <div className="relative flex-auto p-6">
              <div className="flex flex-col gap-4">
                <Heading
                  title="Welcome back"
                  subtitle="Login to your account!"
                />
                <Button
                  outline
                  label="Continue with Google"
                  icon={GoogleIcon}
                  onClick={() => void signIn("google")}
                />
              </div>
            </div>
            {/* footer */}
            <div className="flex flex-col gap-2 p-6">
              <hr />
              <div className="mt-4 text-center font-light text-neutral-500">
                <p>
                  First time using Recomm?
                  <Link
                    href="/register"
                    className="cursor-pointer text-neutral-800 hover:underline"
                  >
                    &nbsp;Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
