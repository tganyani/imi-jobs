import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") as string;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        rooms: {
          include: {
            chats: {
              select: {
                userId: true,
                read: true,
              },
            },
          },
        },
      },
    });
    const nUread = user?.rooms.filter((room:any) =>
      room.chats.some((chat:any) => chat.read === false && chat.userId !== userId)
    );
    return Response.json({
      nUread: nUread?.length,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
