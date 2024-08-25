import { Metadata } from "next";
import signupImage from "@/assets/signup-image.jpg";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import GoogleSignInButton from "../GoogleSignInButton";

export const metadata: Metadata = {
  title: "Sign Up",
};

const Page = () => {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card shadow-2xl">
        <div className="md:w-1/2 w-full space-y-10 p-10 overflow-y-auto">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign up to cirkl</h1>
            <p className="text-muted-foreground">
              <span className="italic">Join</span> Circles.{" "}
              <span className="italic">Connect</span> with Creators.{" "}
              <span className="italic">Engage</span> like never before.
            </p>
          </div>

          <div className="space-y-5">
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <span>OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>
            <SignUpForm />
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Log in &rarr;
            </Link>
          </div>
        </div>
        <Image
          src={signupImage}
          alt=""
          className="w-1/2 object-cover hidden md:block"
        />
      </div>
    </main>
  );
};

export default Page;
