import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") as string;
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        chats: {
          orderBy: {
            dateCreated: "asc",
          },
          select: {
            message: true,
            userId: true,
            dateCreated: true,
            delivered: true,
            read: true,
            id: true,
            media: {
              select: {
                publicId: true,
                url: true,
                originalName: true,
              },
            },
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
            lastSeen: true,
            isOnline: true,
            id: true,
          },
        },
      },
    });
    return Response.json({
      ...room,
      users: room?.users[0],
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
