import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { vaccancyId, userId } = await req.json();
    //
    await prisma.like.create({
      data: {
        userId,
        vaccancyId,
      },
    });

    return Response.json({ liked: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { vaccancyId, userId } = await req.json();
    //
    await prisma.like.delete({
      where: {
        userId_vaccancyId: {
          userId,
          vaccancyId,
        },
      },
    });

    return Response.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") as string;
    const liked = await prisma.like.findMany({
      where: {
        userId,
      },
      orderBy: {
        ceatedAt: "desc",
      },
      select: {
        vaccancy: {
          include: {
            applications: {
              select: { userId: true },
            },
            views: {
              select: {
                id: true,
              },
            },
            likes: {
              select: {
                userId: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return Response.json(liked.map((like:any) => ({ ...like.vaccancy })));
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
