import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vaccancy = await prisma.vaccancy.create({
      data: body,
    });
    return Response.json({ created: true, id: vaccancy.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") as string;
    const city = searchParams.get("city") as string;
    const country = searchParams.get("country") as string;
    const batch = parseInt(searchParams.get("batch") as string);

    const vaccancies = await prisma.vaccancy.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: title, mode: "insensitive" } },
              { description: { contains: title, mode: "insensitive" } },
            ],
          },
          { city: { contains: city, mode: "insensitive" } },
          { country: { contains: country, mode: "insensitive" } },
        ],
      },
      orderBy:{
        updatedAt:"desc"
      },
      take: batch,
      include: {
        _count: true,
        applications: {
          select: {
            userId: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        views: {
          select: {
            userId: true,
          },
        },
        user: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });
    const total = await prisma.vaccancy.count({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: title, mode: "insensitive" } },
              { description: { contains: title, mode: "insensitive" } },
            ],
          },
          { city: { contains: city, mode: "insensitive" } },
          { country: { contains: country, mode: "insensitive" } },
        ],
      },
    });
    return Response.json({
      vaccancies,
      total,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
