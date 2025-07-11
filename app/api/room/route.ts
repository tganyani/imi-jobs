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
              orderBy: {
                dateCreated: "desc",
              },
              take: 1,
              select: {
                message: true,
                userId: true,
                dateCreated: true,
                delivered:true,
                read:true,
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
                image:true,
              },
            },
          },
        },
      },
    });

    return Response.json(
      user?.rooms?.map((room) => ({
        ...room,
        users: room?.users[0],
      }))
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const room = await prisma.room.upsert({
//       where: {
//         name: body.name,
//       },
//       update: {
//         dateUpdated: new Date(),
//       },
//       create: {
//         name: body.name,
//         users: {
//           connect: body.ids.map((id: string) => ({ id })),
//         },
//       },
//     });
//     await prisma.chat.create({
//       data: {
//         message: body.message,
//         roomId: room.id,
//         userId: body.userId,
//       },
//     });
//     return Response.json({ created: true, id: room.id });
//   } catch (err) {
//     console.error(err);
//     return Response.json({ error: "error" }, { status: 500 });
//   }
// }
