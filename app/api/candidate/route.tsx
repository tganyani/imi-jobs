import { sendJobProposalEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") as string;
    const city = searchParams.get("city") as string;
    const country = searchParams.get("country") as string;
    const batch = parseInt(searchParams.get("batch") as string);

    return Response.json(
      await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { position: { contains: title, mode: "insensitive" } },
                { bio: { contains: title, mode: "insensitive" } },
              ],
            },
            { city: { contains: city, mode: "insensitive" } },
            { country: { contains: country, mode: "insensitive" } },
          ],
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: batch,
        select: {
          id: true,
          name: true,
          position: true,
          image: true,
        },
      })
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { vaccancyId, userId, roomData } = await req.json();
    const propose = await prisma.proposal.create({
      data: {
        vaccancyId,
        userId,
      },
      select: {
        id: true,
        vaccancy: {
          select: {
            id: true,
            title: true,
            companyName: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    const room = await prisma.room.upsert({
      where: {
        name: roomData.name,
      },
      update: {
        dateUpdated: new Date(),
      },
      create: {
        name: roomData.name,
        users: {
          connect: roomData.ids.map((id: string) => ({ id })),
        },
      },
    });
    await sendJobProposalEmail(
      propose.user.email,
      propose.vaccancy.title,
      propose.vaccancy.companyName,
      propose.user.name,
      propose.vaccancy.user.name,
      propose.vaccancy.id
    );
    return Response.json({
      proposed: true,
      id: propose.id,
      roomName: room.name,
      roomId: room.id,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
