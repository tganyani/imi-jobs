// "use client"
import { io, Socket } from "socket.io-client";

// Define your expected socket events
type ClientToServerEvents = {
  joinRooms: (userId: string) => void;
  sendMessage: ({
    roomId,
    message,
    userId,
    name,
  }: {
    roomId: string;
    message: string;
    userId: string;
    name: string;
  }) => void;

  sendMessageWithMedia: (
    {
      roomId,
      message,
      userId,
      name,
    }: {
      roomId: string;
      message: string;
      userId: string;
      name: string;
    },
    callback: (response: { chatId: string }) => void
  ) => void;

  read: ({ userId, roomId }: { userId: string; roomId: string }) => void;
  delivery: ({ id }: { id: string }) => void;
  typing: ({ roomName }: { roomName: string }) => void;
  refreshMedia: ({ roomName }: { roomName: string }) => void;
  online: ({ userId }: { userId: string }) => void;
  offline: ({ userId }: { userId: string }) => void;
};

type ServerToClientEvents = {
  newMessage: (userId: string) => void;
  refreshDelivered: () => void;
  refreshRead: () => void;
  userTyping: () => void;
  userOffline: () => void;
  userOnline: () => void;
};


   export const  socket:Socket<ServerToClientEvents, ClientToServerEvents> = io("https://imi-jobs-s-sever.onrender.com", {
      transports: ["websocket"],
    });

