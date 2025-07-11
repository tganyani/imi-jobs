import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { coverLetter, vaccancyId, userId, name, ids } = await req.json();
    //
    const application = await prisma.application.create({
      data: {
        userId,
        vaccancyId,
        coverLetter,
      },
    });

    if (application.id) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          coverLetter,
        },
      });
      const room = await prisma.room.upsert({
        where: {
          name,
        },
        update: {
          dateUpdated: new Date(),
        },
        create: {
          name,
          users: {
            connect: ids.map((id: string) => ({ id })),
          },
        },
      });
      return Response.json({
        created: true,
        roomName: room.name,
        roomId: room.id,
        id:application.id
      });
    }
    return Response.json({ created: false });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
