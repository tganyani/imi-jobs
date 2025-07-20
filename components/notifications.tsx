"use client";
import useSWR from "swr";
import { fetcher, NotificationType } from "@/lib/constant";
import Loading from "@/components/loading";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { Separator } from "@/components/ui/separator";

import { Bell, CircleCheckBig } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { NotificationTyped } from "@/lib/types";
import { useEffect } from "react";

import { Badge } from "./ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

import {socket} from "@/lib/socket"


dayjs.extend(relativeTime);

export default function Notification() {
  const { userId } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vaccancy/notif/${userId}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );
  useEffect(() => {
    const handleRefreshNotification = () => {
      mutate();
    };
    socket?.on("refreshNotif", handleRefreshNotification);
    return () => {
      socket?.off("refreshNotif", handleRefreshNotification);
    };
  }, []);
  const handleNotificationRead = async (id: string) => {
    await axios
      .patch(`/api/vaccancy/notif/${id}`)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleNotificationReadAll = async () => {
    await axios.patch(`/api/vaccancy/notif`).catch((err) => console.error(err));
    mutate();
  };
  return (
    <Popover>
      <PopoverTrigger>
        <div className="relative ">
          <Bell className="h-4 w-4" />
          {data?.filter((notif: NotificationTyped) => notif.read === false)
            .length > 0 && (
            <Badge className="absolute   top-[-4px]  right-[-14px] bg-[var(--mygreen)] text-white rounded-full text-[8px]">
              {
                data?.filter((notif: NotificationTyped) => notif.read === false)
                  .length
              }
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-white border-1 border-stone-300 shadow-sm px-0 ">
        <div className="flex justify-between flex-nowrap items-center px-2">
          <p>Notifications</p>
          <CircleCheckBig
            onClick={handleNotificationReadAll}
            className="h-4 w-4 text-stone-400 hover:text-stone-500 hover:h-5 hover:w-5"
          />
        </div>
        <div className="overflow-y-auto max-h-screen ">
          {error && <div>failed to fetch data</div>}
          {isLoading && <Loading color="gray" />}
          {data?.length > 0 &&
            data.map((notif: NotificationTyped) => (
              <Link
                href={`/rooms/${notif.targetId}`}
                key={notif.id}
                onClick={() => handleNotificationRead(notif.id)}
              >
                <div
                  className={`${
                    notif.read ? "bg-white" : "bg-stone-100"
                  } p-2 hover:opacity-70`}
                >
                  <p
                    className={`text-sm ${
                      notif.type === NotificationType.rejection
                        ? "text-red-500"
                        : notif.type === NotificationType.invitation
                        ? "text-[var(--mygreen)]"
                        : "text-green-500"
                    }`}
                  >
                    {notif.type}
                  </p>
                  <div className="flex justify-between flex-nowrap items-center">
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {notif.fromName} 
                    </p>
                    <p className="text-[11px] whitespace-nowrap">
                      {dayjs(notif.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
                <Separator orientation="horizontal" className="bg-stone-300" />
              </Link>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
