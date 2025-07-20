
import { io, Socket } from "socket.io-client";

// Define your expected socket events
export type ClientToServerEvents = {
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
  typing: ({ roomName, userId }: { roomName: string; userId: string }) => void;
  refreshMedia: ({ roomName }: { roomName: string }) => void;
  online: ({ userId }: { userId: string }) => void;
  offline: ({ userId }: { userId: string }) => void;
  notif: ({ roomName }: { roomName: string }) => void;
};

export type ServerToClientEvents = {
  newMessage: (userId: string) => void;
  refreshDelivered: () => void;
  refreshRead: () => void;
  userTyping: ({ userId }: { userId: string }) => void;
  userOffline: () => void;
  userOnline: () => void;
  refreshNotif: () => void;
};


export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_SOCKET_PROD_SERVER,
  {
    transports: ["websocket"],
  }
);


// let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

//  export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
//   if (typeof window === "undefined") return null; // don't throw, just skip on server

//   if (!socket) {
//     socket = io("http://localhost:5000", {
//       transports: ["websocket"],
//     });
//   }

//   return socket;
// };