"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { Suspense, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/lib/constant";

const GoogleLoginSuccessComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") as string;
  const id = searchParams.get("id") as string;
  const role = searchParams.get("role") as string;
  const logged = searchParams.get("logged");
  const name = searchParams.get("name") as string;
  const { login } = useAuthStore();
  useEffect(() => {
    const handleSetState = () => {
      if (logged) {
        login(email, id, role,name);
        setTimeout(() => {
          if (role === Role.candidate) {
            router.replace("/");
          } else {
            router.replace("/vaccancy/posted");
          }
        }, 2000);
      } else {
        setTimeout(() => {
          router.replace("/signin");
        }, 2000);
      }
    };
    return handleSetState();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-2 ">
      <div className="border-1 p-4 border-stone-200 shadow-sm  rounded-xl text-center space-y-4">
        <p className={`${logged ? "text-green-600" : "text-red-600"}`}>
          {logged
            ? "You have successfully logged in with Google as"
            : "Unable to log in with Google."}
        </p>
        {logged && <p className="text-sm">{email}</p>}
        <Button
          onClick={
            !logged
              ? () => router.replace("/signin")
              : role === Role.candidate
              ? () => router.replace("/")
              : () => router.replace("/vaccancy/posted")
          }
          className="bg-[var(--mygreen)] text-white py-0 w-full "
        >
          {logged ? "continue" : "try again"}
        </Button>
      </div>
    </div>
  );
};

export default function VerifyPassword() {
  return (
    <Suspense fallback={<Loading color="gray" />}>
      <GoogleLoginSuccessComponent />
    </Suspense>
  );
}
