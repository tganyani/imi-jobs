
import Chats from "@/components/chats";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row flex-nowrap">
      <Chats />
      <main className="flex-1 ">{children}</main>
    </div>
  );
}

