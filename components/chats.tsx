"use client";
import useSWR from "swr";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Input } from "./ui/input";
import Loading from "@/components/loading";
import { fetcher, Role, stringToColor } from "@/lib/constant";
import dayjs from "dayjs";
import { RoomType } from "@/lib/types";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useEffect, useState } from "react";
import { CheckCheck, Check, Menu } from "lucide-react";
import DOMPurify from "dompurify";
dayjs.extend(localizedFormat);
import { decryptMessage} from "@/lib/encrypt";

import { socket } from "@/lib/socket";
import CheckAccess from "./checkAccess";

export default function Chats() {
  const router = useRouter();
  const { userId, email, role, isLoggedIn } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const pathname = usePathname();
  const [typingId, setTypingId] = useState<string>("");

  const isRoom =
    pathname.includes("/rooms/") && pathname.split("/rooms/")[1] !== "";
  const { data, error, isLoading, mutate } = useSWR(
    `/api/room?userId=${userId}`,
    fetcher
  );
  useEffect(() => {
    const handleNewMessage = async () => {
      socket?.emit("delivery", { id: userId as string });
      await mutate();
    };
    const handleConnect = () => {
      socket?.emit("joinRooms", userId as string);
      socket?.emit("delivery", { id: userId as string });
    };
    const handleMutate = () => {
      mutate();
    };
    const handleTyping = (data: { userId: string }) => {
      setTypingId(data.userId);
      setTimeout(() => setTypingId(""), 3000);
    };

    socket?.emit("joinRooms", userId as string);
    socket?.emit("delivery", { id: userId as string });
    socket?.on("connect", handleConnect);
    socket?.on("newMessage", handleNewMessage);
    socket?.on("refreshDelivered", handleMutate);
    socket?.on("refreshRead", handleMutate);
    socket?.on("userTyping", handleTyping);
    socket?.on("userOffline", handleMutate);
    socket?.on("userOnline", handleMutate);
    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("connect", handleConnect);
      socket?.off("refreshDelivered", handleMutate);
      socket?.off("refreshRead", handleMutate);
      socket?.off("userOnline", handleMutate);
      socket?.off("userOffline", handleMutate);
      // socket.off("userTyping", handleTyping);
    };
  }, []);

  return (
    <div
      className={`sm:w-100  w-screen ${
        isRoom ? "hidden" : "block"
      } sm:block  h-screen overflow-y-auto bg-neutral-50 overflow-x-hidden`}
    >
      {isLoggedIn && <CheckAccess />}
      <div className="sticky z-2 top-0 p-2  shadow-stone-100 shadow-sm">
        <div className="flex gap-x-4 flex-nowrap items-center">
          <Menu
            onClick={
              role === Role.candidate
                ? () => router.push("/")
                : () => router.push("/vaccancy/posted")
            }
            className="text-stone-300 h-6 w-6 shrink-0"
          />
          <Input
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search"
            className="h-8 rounded-full text-sm focus-visible:ring-0 focus-visible:border-gray-300 border-stone-300"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-2  ">
        {error && <div>error fetching</div>}
        {isLoading && !data ? (
          <Loading color="grey" />
        ) : (
          data
            ?.filter(
              (room: RoomType) =>
                room?.users?.name
                  ?.toLowerCase()
                  ?.includes(searchTerm.toLowerCase()) || !room?.users?.name
            )
            ?.map((room: RoomType) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div
                  className={`flex flex-row flex-nowrap gap-x-4 px-2 rounded-sm items-center ${
                    pathname === `/rooms/${room.id}` ? "bg-stone-200" : ""
                  } hover:bg-stone-100`}
                >
                  <div>
                    <Avatar
                      className="z-1 text-white"
                      style={{
                        backgroundColor: room?.users?.name
                          ? stringToColor(room?.users?.name)
                          : stringToColor(email as string),
                      }}
                    >
                      <AvatarImage
                        src={room?.users?.image}
                        alt="user-profile"
                      />
                      <AvatarFallback>
                        {room?.users?.name ? room?.users?.name[0] : "Y"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col  flex-1">
                    <div className="flex flex-row flex-nowrap justify-between flex-1">
                      <p className="text-sm ">
                        {room?.users?.name ? room?.users?.name : "You"}
                      </p>
                      <p className="text-sm text-gray-500 ">
                        {dayjs(room.chats[0]?.dateCreated).format("LT")}
                      </p>
                    </div>
                    <div className="flex justify-between flex-nowrap  overflow-x-hidden">
                      {typingId === room?.users?.id && !isRoom ? (
                        <p className="text-sm text-green-500">typing ...</p>
                      ) : (
                        <div
                          className="text-sm text-gray-500 line-clamp-1 sm:max-w-80 max-w-[calc(100vw-80px)] "
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(decryptMessage(room.chats[0]?.message)),
                          }}
                        />
                      )}
                      {room?.nUnread > 0 && (
                        <div className="text-sm text-white bg-[var(--mygreen)] px-2 rounded-full">
                          {room?.nUnread}
                        </div>
                      )}
                      {room.chats[0]?.userId === userId && (
                        <div>
                          {room.chats[0]?.delivered ? (
                            <CheckCheck
                              className={`h-4 w-4 stroke-[1]${
                                room.chats[0]?.read
                                  ? " text-green-500"
                                  : " text-gray-500"
                              }`}
                            />
                          ) : (
                            <Check className="h-4 w-4 stroke-[1] text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}
