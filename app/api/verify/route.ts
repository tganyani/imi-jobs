import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, email, adminEmail } = await req.json();
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
      },
    });
    return Response.json({
      message: "Email verified successfully!",
      verified: true,
      email,
      error: "",
      ids: [user.id, admin?.id],
      userId: admin?.id,
      userName: user.name,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
