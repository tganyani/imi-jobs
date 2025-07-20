import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { fromName, targetId, isCandidate, toId, type } = await req.json();
    //
    await prisma.notification.create({
      data: {
        toId,
        fromName,
        targetId,
        isCandidate,
        type,
      },
    });

    return Response.json({ created: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await prisma.notification.updateMany({
      where: {
        read: false,
      },
      data: {
        read: true,
      },
    });

    return Response.json({ updated: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
