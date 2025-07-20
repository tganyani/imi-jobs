"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import {
  Briefcase,
  Heart,
  Luggage,
  MessageCircle,
  UserPlus,
  KeyRound,
  PackagePlus,
  PackageCheck,
} from "lucide-react";
import AccountMenu from "./accountmenu";
import Link from "next/link";
import { Role } from "@/lib/constant";
import ToggleMenu from "./toggleMenu";
import Notification from "./notifications";
import CheckAccess from "./checkAccess";
import { toast } from "sonner";

import axios from "axios";
import { Badge } from "./ui/badge";
import { throttle } from "lodash";
import { socket } from "@/lib/socket";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const navIconStyle = "h-4 w-4 ";
  const { isLoggedIn, role, userId } = useAuthStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [unReadLenght, setunreadLenght] = useState<number>(0);

  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  useEffect(() => {
    if (!isLoggedIn) return;
    const handleConnect = () => {
      socket?.emit("joinRooms", userId as string);
      socket?.emit("delivery", { id: userId as string });
    };

    socket?.emit("online", { userId: userId as string });
    socket?.emit("joinRooms", userId as string);
    socket?.emit("delivery", { id: userId as string });

    const fetchChatsLenght = async () => {
      await axios
        .get(`/api/room/unreadl?userId=${userId}`)
        .then(({ data }) => {
          setunreadLenght(data?.nUread);
        })
        .catch((err) => console.error(err));
    };
    fetchChatsLenght();
    const handleNewMessage = async (data: string) => {
      await fetchChatsLenght();
      if (data !== userId) {
        toast("You have recieved a new message ");
      }
    };
    const throttledFunction = throttle(handleNewMessage, 2000);
    socket?.on("newMessage", throttledFunction);
    socket?.on("connect", handleConnect);

    return () => {
      socket?.off("newMessage", throttledFunction);
    };
  }, [userId, isLoggedIn]);

  if (!hasHydrated) return null;
  return (
    <div className="flex flex-row items-center justify-between px-2">
      {isLoggedIn && <CheckAccess />}
      <div className="flex-1/5">
        <p className="text-[var(--mygreen)] text-[20px] font-bold ">
          Imisebenzi
        </p>
      </div>
      <div className="flex flex-row justify-center gap-x-4 flex-3/5">
        <div className="sm:hidden flex">
          <ToggleMenu unReadLenght={unReadLenght} />
        </div>
        <div className="sm:flex hidden">
          <Link href="/">
            <div
              className={`navItemsStyle ${
                pathname === "/" ? "text-[var(--mygreen)]" : ""
              }`}
            >
              <p>jobs</p>
              <Briefcase className={navIconStyle} />
            </div>
          </Link>
        </div>
        {isLoggedIn && (
          <div className="sm:flex flex-row gap-x-6 hidden">
            {role === Role.candidate && (
              <Link href="/vaccancy/saved">
                <div
                  className={`navItemsStyle ${
                    pathname === "/vaccancy/saved"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}
                >
                  <p>saved</p>
                  <Heart className={navIconStyle} />
                </div>
              </Link>
            )}

            {role === Role.candidate && (
              <Link href="/vaccancy/applied">
                <div
                  className={`navItemsStyle ${
                    pathname === "/vaccancy/applied"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}
                >
                  <p>applied</p>
                  <Luggage className={navIconStyle} />
                </div>
              </Link>
            )}

            <Link href="/rooms">
              <div className="navItemsStyle">
                <p>chats</p>

                <div className="relative ">
                  <MessageCircle className={navIconStyle} />
                  {unReadLenght > 0 && (
                    <Badge className="absolute   top-[-4px]  right-[-12px] bg-[var(--mygreen)] text-white rounded-full text-[8px]">
                      {unReadLenght}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>

            {role === Role.recruiter && (
              <Link href="/vaccancy/posted">
                <div
                  className={`navItemsStyle ${
                    pathname === "/vaccancy/posted"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}
                >
                  <p>posted</p>
                  <PackageCheck className={navIconStyle} />
                </div>
              </Link>
            )}

            {role === Role.recruiter && (
              <Link href="/vaccancy/post">
                <div
                  className={`navItemsStyle ${
                    pathname === "/vaccancy/post" ? "text-[var(--mygreen)]" : ""
                  }`}
                >
                  <p>add</p>
                  <PackagePlus className={navIconStyle} />
                </div>
              </Link>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <div className="sm:flex flex-row gap-x-6 hidden">
            <Link href="/signin">
              <div
                className={`navItemsStyle ${
                  pathname === "/signin" ? "text-[var(--mygreen)]" : ""
                }`}
              >
                <p>login</p>
                <KeyRound className={navIconStyle} />
              </div>
            </Link>
            <Link href="/signup">
              <div
                className={`navItemsStyle ${
                  pathname === "/signup" ? "text-[var(--mygreen)]" : ""
                }`}
              >
                <p>register</p>
                <UserPlus className={navIconStyle} />
              </div>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between items-center gap-x-6">
        {isLoggedIn && (
          <div className="relative ">
            <MessageCircle
              onClick={() => router.push("/rooms")}
              className="h-4 w-4 sm:hidden"
            />
            {unReadLenght > 0 && (
              <Badge
                onClick={() => router.push("/rooms")}
                className="absolute sm:hidden   top-[-4px]  right-[-12px] bg-[var(--mygreen)] text-white rounded-full text-[8px]"
              >
                {unReadLenght}
              </Badge>
            )}
          </div>
        )}
        {isLoggedIn && <Notification />}
        <AccountMenu />
      </div>
    </div>
  );
}
