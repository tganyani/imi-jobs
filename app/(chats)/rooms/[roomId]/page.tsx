"use client";
import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { encryptMessage,decryptMessage} from "@/lib/encrypt";
import {
  CheckCheck,
  Paperclip,
  SendHorizontal,
  MoveLeft,
  Check,
  Clock,
  CircleX,
  File,
} from "lucide-react";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";
import Loading from "@/components/loading";
import { LoaderCircle } from "lucide-react"
import {
  fetcher,
  formatFileSize,
  isImageFile,
  linkifyAll,
} from "@/lib/constant";
import dayjs from "dayjs";
import { Chat, RoomType } from "@/lib/types";
import localizedFormat from "dayjs/plugin/localizedFormat";
import axios from "axios";
dayjs.extend(localizedFormat);

import RoomPopover from "@/components/roomPopover";
import { socket } from "@/lib/socket";
import CheckAccess from "@/components/checkAccess";

export default function Room() {
  const router = useRouter();
  const { userId ,isLoggedIn} = useAuthStore() as { userId: string ,isLoggedIn:boolean};
  const { roomId } = useParams() as { roomId: string };
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollMessage = useRef<null | HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { data, error, isLoading, mutate } = useSWR<RoomType>(
    `/api/room/${roomId}?userId=${userId}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      // "application/msword": [], // .doc
      // "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      // [], // .docx
    },
    multiple: true,
  });

  // const handleTyping = (data: { userId: string }) => {
  //     if (data.userId === userId) {
  //       setIsTyping(true);
  //       setTimeout(() => setIsTyping(false), 10000);
  //     }
  //   };

  useEffect(() => {
    const handleNewMessage = async (id: string) => {
      await mutate();
      if (id !== userId) {
        scrollMessage.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }
      socket?.emit("read", { userId, roomId });
    };
    const handleConnect = () => {
      socket?.emit("joinRooms", userId as string);
      socket?.emit("read", { userId, roomId });
    };
    const handleMutate = () => {
      mutate();
    };

    socket?.on("connect", handleConnect);
    socket?.on("newMessage", handleNewMessage);
    socket?.on("refreshDelivered", handleMutate);
    socket?.on("refreshRead", handleMutate);
    socket?.emit("read", { userId, roomId });
    socket?.emit("joinRooms", userId as string);
    socket?.on("userTyping", (data) => {
      if (data.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });
    socket?.on("userOffline", handleMutate);
    socket?.on("userOnline", handleMutate);

    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("connect", handleConnect);
      socket?.off("refreshDelivered", handleMutate);
      socket?.off("refreshRead", handleMutate);
      socket?.off("userOnline", handleMutate);
      socket?.off("userOffline", handleMutate);
      // socket.off("userTyping",handleTyping)
    };
  }, []);
  useEffect(() => {
    // scroll to the bottom at first render
    scrollMessage.current?.scrollIntoView({
      block: "end",
      behavior: "smooth",
    });
  }, [data]);

  const throttledTyping = throttle(() => {
    socket?.emit("typing", { roomName: data?.name as string, userId });
  }, 3000);
  useEffect(() => {
    throttledTyping();
  }, [message]);

  const handlesendMessage = async () => {
    scrollMessage.current?.scrollIntoView({
      block: "end",
      behavior: "smooth",
    });
    mutate((currentData) => {
      if (currentData) {
        return {
          ...currentData,
          chats: [
            ...currentData.chats,
            {
              message,
              userId,
              dateCreated: new Date().toISOString(),
              delivered: false,
              read: false,
              id: new Date().toISOString(),
              sending: true,
              media: [],
            },
          ],
        };
      }
      return currentData;
    }, false);

    if (data) {
      if (files.length > 0) {
        socket?.emit(
          "sendMessageWithMedia",
          {
            name: data?.name,
            message:encryptMessage(message),
            roomId,
            userId,
          },
          async ({ chatId }) => {
            if (chatId) {
              setLoading(true);
              const formData = new FormData();
              files.forEach((file) => formData.append("files", file));
              formData.append("chatId", chatId);
              await axios
                .post("/api/chat", formData)
                .then((res) => {
                  socket?.emit("refreshMedia", { roomName: data.name });
                  setFiles([]);

                  return res.data;
                })
                .catch((err) => console.error(err));
              setLoading(false);
            }
          }
        );
      } else {
        await socket?.emit("sendMessage", {
         message:encryptMessage(message),
          userId,
          name: data.name,
          roomId,
        });
      }
    }

    setMessage("");
  };

  const removeFile = (url: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== url));
  };
  if (!data && !isLoading) return null;
  return (
    <div className="h-screen flex flex-col ">
      {
        isLoggedIn&&<CheckAccess/>
      }
      {/* header */}
      <div className="sticky top-0 p-2 bg-white shadow-stone-100 shadow-sm sm:border-1 sm:border-stone-200">
        <div className="flex flex-row flex-nowrap justify-between items-center">
          <div className="sm:hidden block">
            <MoveLeft
              onClick={() => router.push("/rooms")}
              className=" text-stone-300"
            />
          </div>
          {isLoading && !data ? (
            <div className="flex flex-col gap-y-2">
              <Skeleton className="h-4 w-40 rounded-full bg-stone-200" />
              <Skeleton className="h-4 w-30 rounded-full bg-stone-200" />
            </div>
          ) : (
            <div>
              <p className="text-sm">{data?.users?.name}</p>
              {isTyping ? (
                <p className="text-sm text-green-500">typing ...</p>
              ) : data?.users?.isOnline ? (
                <p className="text-sm text-green-500">online</p>
              ) : (
                <p className="text-sm text-gray-500">
                  last seen {dayjs(data?.users?.lastSeen).format("LT")}
                </p>
              )}
            </div>
          )}
          <div>
            <RoomPopover
              userId={data?.users ? (data?.users.id as string) : userId}
            />
          </div>
        </div>
      </div>
      {/* chats */}
      <div className="flex flex-col gap-y-4 p-2 flex-1 overflow-auto  ">
        {error && <div>error fetching</div>}
        {isLoading ? (
          <Loading color="grey" />
        ) : (
          data?.chats?.map((chat: Chat, index: number) => (
            <div key={chat.id}>
              <div className="flex justify-center">
                {index > 0 &&
                data.chats[index - 1]?.dateCreated.split("T")[0] ===
                  chat.dateCreated.split("T")[0] ? (
                  <p> </p>
                ) : (
                  <p className=" text-sm">
                    {dayjs(chat.dateCreated).format("LL")}
                  </p>
                )}
              </div>
              <div
                className={`flex ${
                  chat.userId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`sm:max-w-[70%] max-w-[85%] w-fit ${
                    chat.userId === userId ? "bg-neutral-200" : "bg-cyan-50"
                  } p-2 rounded-2xl`}
                >
                  {chat.media.map((md) => (
                    <div key={md.publicId}>
                      {isImageFile(md.url) ? (
                        <a href={md.url} download>
                          <img
                          src={md.url}
                          alt={md.originalName}
                          className="max-w-50 max-h-50 rounded-lg"
                        />
                        </a>
                      ) : (
                        <div className="flex flex-nowrap items-center">
                          <File className="h-4 w-4 text-gray-500" />
                          <a
                            href={md.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            {md.originalName}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  <p
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(linkifyAll(decryptMessage(chat.message))),
                    }}
                  />
                  <div className="flex justify-between flex-nowrap items-center">
                    <p className="text-stone-400 text-sm">
                      {dayjs(chat.dateCreated).format("LT")}
                    </p>
                    {chat.userId === userId && (
                      <div>
                        {chat?.sending ? (
                          <Clock className="h-4 w-4 stroke-[1] text-gray-500" />
                        ) : chat.delivered ? (
                          <CheckCheck
                            className={`h-4 w-4 stroke-[1]${
                              chat.read ? " text-green-500" : " text-gray-500"
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
            </div>
          ))
        )}
        {/* scroll bottom */}
        <div ref={scrollMessage} className="mt-16" />
      </div>
      {/* input */}
      <div className="sticky bottom-0 p-2 bg-white shadow-stone-100 shadow-sm sm:border-1 sm:border-stone-200">
        {
          // preview
          <div className="flex flex-row gap-2 flex-wrap">
            {files?.map((file) => (
              <div
                key={URL.createObjectURL(file)}
                className="relative w-20 mb-2 h-20 border-1 border-gray-300 rounded-sm"
              >
                {loading ? (
                  <LoaderCircle className="h-w w-4 text-[var(--mygreen)] animate-spin absolute top-0 z-2 right-0"/>
                ) : (
                  <CircleX
                    onClick={() => removeFile(file.name)}
                    className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500 absolute top-0 z-2 right-0"
                  />
                )}
                {file.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="chat-media"
                    layout="fill"
                    objectFit="cover"
                    className="rounded shadow"
                    unoptimized // 🔥 Required for object URLs
                  />
                ) : (
                  <div className="flex justify-between flex-nowrap mt-4 ">
                    <File className="h-4 w-4 text-gray-500" />
                    <div className="overflow-hidden w-14">
                      <p className="text-sm line-clamp-1 ">{file.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
        <div className="flex justify-between gap-x-2 flex-nowrap items-center">
          <div
            {...getRootProps()}
            className=" p-2 border-1 border-gray-300 rounded-full flex items-center justify-center"
          >
            <input {...getInputProps()} />
            <Paperclip className="text-stone-300 h-4 w-4" />
          </div>
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder={files.length > 0 ? "add caption" : "type something"}
            className="min-h-8 rounded-full text-sm focus-visible:ring-0 focus-visible:border-gray-300 border-stone-300"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handlesendMessage();
              }
            }}
          />
          {(message || files.length>0)&&!loading && (
            <div
              onClick={handlesendMessage}
              className="p-2 border-1 border-gray-300 rounded-full flex items-center justify-center"
            >
              <SendHorizontal className="text-stone-300 p-0 h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
