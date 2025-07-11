"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator"

import { Bell, CircleCheckBig } from "lucide-react";

export default function Notification() {
  return (
    <Popover>
      <PopoverTrigger>
        <Bell className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="bg-white border-1 border-stone-300 shadow-sm">
        <div className="flex justify-between flex-nowrap items-center">
          <p>Notifications</p>
          <CircleCheckBig className="h-4 w-4 text-stone-400" />
        </div>
        <div className="">
            <div className="py-2">
                <p className="text-sm text-gray-500">You have recieved an application</p>
                <div className="flex justify-between flex-nowrap items-center">
                    <p  className="text-[11px] text-stone-400">Tatenda Ganyani</p>
                    <p  className="text-[11px]">2 minutes ago</p>
                </div>
            </div>
             <Separator orientation="horizontal" className="bg-stone-300"/>
            {/*  */}
            <div>
                <p className="text-sm text-green-500">You have recieved an  invitaion</p>
                <div className="flex justify-between flex-nowrap items-center">
                    <p  className="text-[11px] text-stone-400">Tatenda Ganyani</p>
                    <p  className="text-[11px]">2 minutes ago</p>
                </div>
            </div>
            {/*  */}
            <Separator orientation="horizontal" className="bg-stone-300" />
            <div>
                <p className="text-sm text-red-500">You have recieved a rejection</p>
                <div className="flex justify-between flex-nowrap items-center">
                    <p  className="text-[11px] text-stone-400">Tatenda Ganyani</p>
                    <p  className="text-[11px]">2 minutes ago</p>
                </div>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
