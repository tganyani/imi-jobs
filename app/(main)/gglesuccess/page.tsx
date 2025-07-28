"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { Suspense, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { generateRoomName, Role } from "@/lib/constant";
import axios from "axios";
import { socket } from "@/lib/socket";
import { encryptMessage} from "@/lib/encrypt";

const GoogleLoginSuccessComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") as string;
  const id = searchParams.get("id") as string;
  const role = searchParams.get("role") as string;
  const logged = searchParams.get("logged");
  const name = searchParams.get("name") as string;
  const other = searchParams.get("other") as string;
  const nw = searchParams.get("nw");
  const { login } = useAuthStore();
  const handeSendWelcome = async () => {
    await axios
      .post("/api/room", {
        name: generateRoomName(
          process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
          email as string
        ),
        ids: [id, other],
      })
      .then((res) => {
        if (res.data.created) {
          socket?.emit("sendMessage", {
            message: encryptMessage(`Hello ${name}! welcome to imisebenzi ,you can post or apply jobs here `),
            userId: other,
            name: res.data.name,
            roomId: res.data.id,
          });
        }
      });
  };
  useEffect(() => {
    const handleSetState = async () => {
      if (logged) {
        login(email, id, role, name);
        // send welcome message

        if (nw) {
          await handeSendWelcome();
        }

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
    handleSetState();
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
