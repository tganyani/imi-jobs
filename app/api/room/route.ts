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
          orderBy:{
            dateUpdated:"desc"
          },
          include: {
            _count: {
              select: {
                chats: {
                  where: {
                    read: false,
                    NOT: { userId },
                  },
                },
              },
            },
            chats: {
              orderBy: {
                dateCreated: "desc",
              },
              take: 1,
              select: {
                message: true,
                userId: true,
                dateCreated: true,
                delivered: true,
                read: true,
              },
            },
            users: {
              where: {
                NOT: {
                  id: userId,
                },
              },
              select: {
                name: true,
                image: true,
                id:true
              },
            },
          },
        },
      },
    });

    return Response.json(
      user?.rooms?.map((room:any) => ({
        ...room,
        users: room?.users[0],
        nUnread:room._count.chats
      }))
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const room = await prisma.room.upsert({
      where: {
        name: body.name,
      },
      update: {
        dateUpdated: new Date(),
      },
      create: {
        name: body.name,
        users: {
          connect: body.ids.map((id: string) => ({ id })),
        },
      },
    });
   
    return Response.json({ created: true, id: room.id ,name:room.name});
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
