import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employHistroy = await prisma.employmentHistory.create({
      data: body,
    });
    return Response.json({ created: true, id: employHistroy.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
