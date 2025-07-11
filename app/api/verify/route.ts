import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export  async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 400 });
    const compare = await bcrypt.compare(code, user.verificationCode as string);
    if (!compare) {
      return Response.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { verified: true, verificationCode: null },
    });

    return Response.json({
      message: "Email verified successfully!",
      verified: true,
      email
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
