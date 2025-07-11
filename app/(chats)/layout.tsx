
import Chats from "@/components/chats"
import "@/app/globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      <body  className={`${geistSans.variable} ${geistMono.variable}  antialiased flex flex-row flex-nowrap `}>
        <Chats/>
        <main className="flex-1 ">{children}</main>
      </body>
    </html>
  )
}