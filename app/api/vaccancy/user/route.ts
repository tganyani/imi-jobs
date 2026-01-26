import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") as string;
    const applications = await prisma.application.findMany({
      where: {
        userId,
      },
      orderBy: {
        ceatedAt: "desc",
      },
      select: {
        id: true,
        coverLetter: true,
        ceatedAt: true,
        status: true,
        vaccancy: {
          select: {
            _count: {
              select: {
                applications: true,
                views: true,
              },
            },
            title: true,
            userId: true,
            id: true,
            user: {
              select: {
                rooms: {
                  where: {
                    users: {
                      some: {
                        id: userId,
                      },
                    },
                  },
                  include: {
                    users: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return Response.json(
      applications.map((aplcn:any) => ({
        id: aplcn.id,
        letter: aplcn.coverLetter,
        status: aplcn.status,
        createdAt: aplcn.ceatedAt,
        nApplications: aplcn.vaccancy._count.applications,
        jobTitle: aplcn.vaccancy.title,
        jobId: aplcn.vaccancy.id,
        nViews: aplcn.vaccancy._count.views,
        roomId: aplcn.vaccancy.user.rooms.filter((room:any) =>
          room.users.some((user:any) => user.id === aplcn.vaccancy.userId)
        )[0].id,
      }))
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
