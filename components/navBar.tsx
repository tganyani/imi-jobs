"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
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


import { socket } from "@/lib/socket";

export default function NavBar() {
  const navIconStyle = "h-4 w-4 ";
  const { isLoggedIn, role ,userId} = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)
  useEffect(() => {
    setHasHydrated(true);
  }, []);
useEffect(()=>{
    socket.emit("online",{userId:userId as string})
  },[userId])
  if (!hasHydrated) return null;
  return (
    <div className="flex flex-row items-center justify-between">
      <CheckAccess/>
      <div className="flex-1/5">
        <p className="text-[var(--mygreen)] text-[20px]">Imisebensi</p>
      </div>
      <div className="flex flex-row justify-center gap-x-4 flex-3/5">
      <div className="sm:hidden flex">
        <ToggleMenu/>
      </div>
        <div className="sm:flex hidden" >
          <Link href="/">
            <div className="navItemsStyle">
              <p>jobs</p>
              <Briefcase className={navIconStyle} />
            </div>
          </Link>
        </div>
        {isLoggedIn && (
          <div className="sm:flex flex-row gap-x-6 hidden">
            {role === Role.candidate && (
              <Link href="/vaccancy/saved">
                <div className="navItemsStyle">
                  <p>saved</p>
                  <Heart className={navIconStyle} />
                </div>
              </Link>
            )}

            {role === Role.candidate && (
              <Link href="/vaccancy/applied">
                <div className="navItemsStyle">
                  <p>applied</p>
                  <Luggage className={navIconStyle} />
                </div>
              </Link>
            )}

            <Link href="/rooms">
              <div className="navItemsStyle">
                <p>chats</p>
                <MessageCircle className={navIconStyle} />
              </div>
            </Link>

            {role === Role.recruiter && (
              <Link href="/vaccancy/posted">
                <div className="navItemsStyle">
                  <p>posted</p>
                  <PackageCheck className={navIconStyle} />
                </div>
              </Link>
            )}

            {role === Role.recruiter && (
              <Link href="/vaccancy/post">
                <div className="navItemsStyle">
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
              <div className="navItemsStyle">
                <p>login</p>
                <KeyRound className={navIconStyle} />
              </div>
            </Link>
            <Link href="/signup">
              <div className="navItemsStyle">
                <p>register</p>
                <UserPlus className={navIconStyle} />
              </div>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between items-center gap-x-6">
        <MessageCircle className="h-4 w-4 sm:hidden"/>
        <Notification/>
        <AccountMenu />
      </div>
    </div>
  );
}
