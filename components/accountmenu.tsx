"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CircleUser, User, Redo2, LogOut, LogIn } from "lucide-react";
// import { Settings } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Role, stringToColor } from "@/lib/constant";

import { socket } from "@/lib/socket";

export default function AccountMenu() {
  const router = useRouter();
  const { email, logout, setRole, role, userId, isLoggedIn,name } = useAuthStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const changeAccount = async () => {
    const newRole = role === Role.candidate ? Role.recruiter : Role.candidate;
    await axios
      .patch(`/api/candidate/${userId}`, { role: newRole })
      .then(({ data }) => {
        if (data.id) {
          setRole(newRole);
          if (newRole === Role.candidate) {
            router.push("/");
          } else {
            router.push("/vaccancy/posted");
          }
        }
      })
      .catch((err) => console.error(err));
  };
  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none ">
        {isLoggedIn ? (
          <Avatar
            className="text-white"
            style={{ backgroundColor: stringToColor(email as string) }}
          >
            <AvatarFallback>{name ? name[0] : "o"}</AvatarFallback>
          </Avatar>
        ) : (
          <CircleUser />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-none bg-white shadow-lg">
        {isLoggedIn ? (
          <>
            <DropdownMenuLabel className="text-gray-400">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="flex flex-row flex-nowrap justify-between px-4  py-1 text-stone-500 hover:opacity-60">
                <p>profile</p>
                <User className="h-4 w-4" />
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={changeAccount}
              className="flex flex-row flex-nowrap justify-between px-4  py-1  text-stone-500 hover:opacity-60"
            >
              <p>
                {role === Role.candidate
                  ? "become recruiter"
                  : "become candidate"}
              </p>{" "}
              <Redo2 className="h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem className="flex flex-row flex-nowrap justify-between px-4 py-1">
          <p>settings </p>
          <Settings className="h-4 w-4" />
        </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex text-red-500 flex-row flex-nowrap justify-between font-bold px-4 border-2 border-red-500 rounded-full py-1 hover:opacity-60"
              onClick={async () => {
                await axios
                  .post("/api/logout")
                  .catch((err) => console.error(err));
                socket?.emit("offline", { userId: userId as string });
                router.push("/signin");
                logout();
              }}
            >
              <p>logout</p> <LogOut className="h-4 w-4" />
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            className="flex text-[var(--mygreen)] flex-row flex-nowrap justify-between font-bold px-4 border-2 border-[var(--mygreen)] rounded-full py-1 hover:opacity-60"
            onClick={() => {
              router.push("/signin");
            }}
          >
            <p>login</p> <LogIn className="h-4 w-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
