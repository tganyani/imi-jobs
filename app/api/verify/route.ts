import { generateRoomName } from "@/lib/constant";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, email, adminEmail, fpasswsord } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 400 });
    const compare = await bcrypt.compare(code, user.verificationCode as string);
    if (!compare) {
      return Response.json({
        error: "Invalid verification code",
        verified: false,
      });
    }

    await prisma.user.update({
      where: { email },
      data: { verified: true, verificationCode: null },
    });
    const admin = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!fpasswsord) {
      const name = generateRoomName(admin?.email as string, user.email);
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
            connect: [admin?.id as string, user.id].map((id: string) => ({
              id,
            })),
          },
        },
      });
      return Response.json({
        message: "Email verified successfully!",
        verified: true,
        email,
        error: "",
        id: room.id,
        userId: admin?.id,
        name: room.name,
        userName: user.name,
      });
    }

    return Response.json({
      message: "Email verified successfully!",
      verified: true,
      email,
      error: "",
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
