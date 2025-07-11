import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vaccancyId = searchParams.get("vaccancyId") as string;
    const recruiterId = searchParams.get("recruiterId") as string;
    const applications = await prisma.application.findMany({
      where: {
        vaccancyId,
      },
      orderBy: {
        ceatedAt: "desc",
      },
      select: {
        userId: true,
        id: true,
        coverLetter: true,
        status: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            rooms: {
              take:1,
              where: {
                users: {
                  some: {
                    id: recruiterId,
                  },
                },
              },
            },
          },
        },
      },
    });
    return Response.json(
      applications.map(({ user, ...rest }) => ({
        ...rest,
        candidateName: user.name,
        roomId:user.rooms[0]?.id,
        roomName:user.rooms[0]?.name
      }))
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
