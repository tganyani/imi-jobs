import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import jsonwebtoken from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { password, email } = await req.json();
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user)
      return Response.json({ error: "User not Registered" }, { status: 400 });
    const compare = await bcrypt.compare(password, user.password);
    if (compare) {
      const access_token = jsonwebtoken.sign(
        {
          id: user.id,
        },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: "15m" }
      );
      const refresh_token = jsonwebtoken.sign(
        {
          id: user.id,
        },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "1h" }
      );
      cookieStore.set("access_token", access_token, {
        httpOnly: true,
        secure: true,
      });

      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
      });
      cookieStore.set("role", user.role, {
        httpOnly: true,
        secure: true,
      });
      return Response.json({
        id: user.id,
        email: user.email,
        role: user.role,
        logged: true,
        access_token,
        refresh_token,
      });
    }
    return Response.json({ error: "Wrong email or pasword" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" });
  }
}
