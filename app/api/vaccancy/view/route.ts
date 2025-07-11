import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { vaccancyId, userId } = await req.json();
    await prisma.view.upsert({
      where: {
        userId_vaccancyId: {
          userId,
          vaccancyId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        vaccancyId,
        userId,
      },
    });

    return Response.json({ viewed: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
