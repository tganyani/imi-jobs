"use client";
import { useMediaQuery } from "react-responsive";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import Link from "next/link";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  Menu,
  X,
} from "lucide-react";
import { Role } from "@/lib/constant";
import { Badge } from "./ui/badge";

export default function ToggleMenu({ unReadLenght }: { unReadLenght: number }) {
  const pathname = usePathname();
  const navIconStyle = "h-4 w-4";
  const { isLoggedIn, role } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  const isSmallScreen = useMediaQuery({ minWidth: 640 });
  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  useEffect(() => {
    if (isSmallScreen && open) {
      setOpen(false);
    }
  }, [isSmallScreen, open]);
  if (!hasHydrated) return null;
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Menu />
      </DrawerTrigger>

      <DrawerContent className="left-0 right-auto ">
        <VisuallyHidden>
          <DrawerTitle>Toggle Menu</DrawerTitle>
        </VisuallyHidden>
        <DrawerClose className="absolute top-4 right-4">
          <X className="h-5 w-5 text-stone-400" onClick={() => setOpen(true)} />
        </DrawerClose>
        <div className="p-4 mt-10">
          <div className="flex flex-col items-center  mb-8">
            <Link href="/" onClick={() => setOpen(false)}>
              <div  className={`navItemsStyle ${
                    pathname === "/"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                <p>jobs</p>
                <Briefcase className={navIconStyle} />
              </div>
            </Link>
          </div>
          {isLoggedIn && (
            <div className="flex flex-col items-center gap-y-8">
              {role === Role.candidate && (
                <Link href="/vaccancy/saved" onClick={() => setOpen(false)}>
                  <div  className={`navItemsStyle ${
                    pathname === "/vaccancy/saved"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                    <p>saved</p>
                    <Heart className={navIconStyle} />
                  </div>
                </Link>
              )}

              {role === Role.candidate && (
                <Link href="/vaccancy/applied" onClick={() => setOpen(false)}>
                  <div  className={`navItemsStyle ${
                    pathname === "/vaccancy/applied"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                    <p>applied</p>
                    <Luggage className={navIconStyle} />
                  </div>
                </Link>
              )}

              <Link href="/rooms" onClick={() => setOpen(false)}>
                <div className="navItemsStyle">
                  <p>chats</p>
                  <div className="relative ">
                    <MessageCircle className={navIconStyle} />
                    {unReadLenght > 0 && (
                      <Badge className="absolute   top-[-4px]  right-[-14px] bg-[var(--mygreen)] text-white rounded-full text-[8px]">
                        {unReadLenght}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>

              {role === Role.recruiter && (
                <Link href="/vaccancy/posted" onClick={() => setOpen(false)}>
                  <div  className={`navItemsStyle ${
                    pathname === "/vaccancy/posted"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                    <p>posted</p>
                    <PackageCheck className={navIconStyle} />
                  </div>
                </Link>
              )}

              {role === Role.recruiter && (
                <Link href="/vaccancy/post" onClick={() => setOpen(false)}>
                  <div  className={`navItemsStyle ${
                    pathname === "/vaccancy/post"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                    <p>add</p>
                    <PackagePlus className={navIconStyle} />
                  </div>
                </Link>
              )}
            </div>
          )}
          {!isLoggedIn && (
            <div className="flex flex-col items-center gap-y-8">
              <Link href="/signin" onClick={() => setOpen(false)}>
                <div  className={`navItemsStyle ${
                    pathname === "/signin"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                  <p>login</p>
                  <KeyRound className={navIconStyle} />
                </div>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <div  className={`navItemsStyle ${
                    pathname === "/signup"
                      ? "text-[var(--mygreen)]"
                      : ""
                  }`}>
                  <p>register</p>
                  <UserPlus className={navIconStyle} />
                </div>
              </Link>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
