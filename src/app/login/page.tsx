import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/components/user-auth-form"
import Container from "@/components/Container"
import { getServerAuthSession } from "@/server/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default async function LoginPage() {

  const session = await getServerAuthSession()
  if(session && session.user) {
    redirect("/profile")
  }
  
  return (
    <Container>
      <div className="mx-auto my-24 sm:my-32 flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below
          </p>
        </div>
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </Container>
  )
}
