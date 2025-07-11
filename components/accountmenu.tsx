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
import { CircleUser, User, Redo2, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Role } from "@/lib/constant";

import { socket } from "@/lib/socket";


export default function AccountMenu() {
  const router = useRouter();
  const { email, logout, setRole, role, userId } = useAuthStore();
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
        <CircleUser />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-none bg-white shadow-lg">
        <DropdownMenuLabel className="text-gray-400">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-row flex-nowrap justify-between px-4 border-1 border-stone-400 rounded-full py-1">
          <Link href="/profile">profile</Link>
          <User className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={changeAccount}
          className="flex flex-row flex-nowrap justify-between px-4 border-1 border-stone-400 rounded-full py-1"
        >
          <p>
            {role === Role.candidate ? "become rcruiter" : "become candidate"}
          </p>{" "}
          <Redo2 className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-row flex-nowrap justify-between px-4 border-1 border-stone-400 rounded-full py-1">
          <p>settings </p>
          <Settings className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex text-red-500 flex-row flex-nowrap justify-between px-4 border-1 border-red-500 rounded-full py-1"
          onClick={() => {
            router.push("/signin")
            logout()
            socket.emit("offline",{userId:userId as string})
          }}
        >
          <p>logout</p> <LogOut className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
