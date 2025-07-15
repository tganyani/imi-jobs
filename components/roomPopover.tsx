"use client";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Separator } from "@/components/ui/separator"

import { EllipsisVertical } from "lucide-react";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/authStore";

export default function RoomPopover({ userId }: { userId: string }) {
  const router = useRouter();
  const {userId:currentUserId}= useAuthStore() as {userId:string}
  return (
    <Popover>
      <PopoverTrigger>
        <EllipsisVertical className=" text-stone-300" />
      </PopoverTrigger>
      <PopoverContent className="bg-white border-1 border-stone-300 shadow-sm w-auto">
        <Button onClick={userId===currentUserId?() => router.push(`/profile`):() => router.push(`/pb/${userId}`)} variant="link">
          view profile
        </Button>
      </PopoverContent>
    </Popover>
  );
}
