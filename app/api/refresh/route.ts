// import prisma from "@/lib/prisma";
// import { NextRequest } from "next/server";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
interface MyPayload extends JwtPayload {
  userId: string;
  email: string;
}

export async function POST() {
  const cookieStore = await cookies();
  try {
    const refreshToken = cookieStore.get("refresh_token")?.value as string;
    const decoded = (jsonwebtoken.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as  MyPayload);
    const access_token = jsonwebtoken.sign(
      { id:decoded.id},
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "1h" }
    );
    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: true,
    });

    return Response.json({ refreshed: true, access_token });
  } catch (err) {
    console.error(err);
    return Response.json({refreshed: false, });
  }
}
