"use client";
import { usePathname } from "next/navigation"
 


export default function ChatsWelcome() {
  const pathname = usePathname()
  const isRoom = pathname.includes("/rooms/") && pathname.split("/rooms/")[1] !== ""
  return <div className={`${isRoom?"block":"hidden"} sm:block`}>Click any of the chats to start conversation</div>;
}
