import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findFirst({
      where: {
        AND: [{ email: { equals: email } }, { verified: { equals: true } }],
      },
    });
    if (!user)
      return Response.json({ error: "Email not registered" }, { status: 400 });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
    return Response.json({
      message: "Password successfully reset",
      reset: true,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
