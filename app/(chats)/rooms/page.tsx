"use client";
import { usePathname } from "next/navigation";

export default function ChatsWelcome() {
  const pathname = usePathname();
  const isRoom =
    pathname.includes("/rooms/") && pathname.split("/rooms/")[1] !== "";
  return (
    <div
      className={`${
        isRoom ? "flex" : "hidden"
      } sm:flex h-screen justify-center items-center  `}
    >
      <p className="text-sm text-stone-400 p-4 shadow-sm shadow-stone-200">Click any of the chats or connect to a job to start conversation  </p>
    </div>
  );
}
