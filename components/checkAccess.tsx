"use client";
import axios from "axios";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

import { socket } from "@/lib/socket";

export default function CheckAccess() {
  const { logout ,userId} = useAuthStore();
  useEffect(() => {
    let logoutTimeout: NodeJS.Timeout;

    const checkAccess = async () => {
      try {
        const { data } = await axios.get("/api/checkaccess");

        if (data?.valide && data?.exp) {
          const expiryTime = Number(data.exp) * 1000;
          const now = Date.now();
          const scheduleTime = expiryTime - now;

          if (scheduleTime > 0) {

            logoutTimeout = setTimeout(() => {
              logout();
              socket.emit("offline",{userId:userId as string})
            }, scheduleTime);
          } else {
            logout(); // Token already expired
            socket.emit("offline",{userId:userId as string})
          }
        } else {
          logout(); // Not valid or missing exp
          socket.emit("offline",{userId:userId as string})
        }
      } catch (err) {
        console.error("Access check failed:", err);
        logout();
        socket.emit("offline",{userId:userId as string})
      }
    };

    checkAccess();

    return () => {
      clearTimeout(logoutTimeout);
    };
  }, [logout]);

  return null
}
