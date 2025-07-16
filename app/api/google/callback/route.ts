import prisma from "@/lib/prisma";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import jsonwebtoken from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: "v2",
    auth: oauth2Client,
  });

  const { data: userInfo } = await oauth2.userinfo.get();

  if (userInfo.verified_email) {
    const user = await prisma.user.upsert({
      where: {
        email: userInfo.email as string,
      },
      update: {
        isOnline: true,
      },
      create: {
        email: userInfo.email as string,
        name: userInfo.name as string,
        image: userInfo.picture as string,
        password: "",
      },
    });
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
    // return Response.json({
    //   id: user.id,
    //   email: user.email,
    //   role: user.role,
    //   logged: true,
    //   access_token,
    //   refresh_token,
    // });
    return NextResponse.redirect(
      new URL(
        `/gglesuccess?email=${user.email}&id=${user.id}&role=${user.role}&logged=true`,
        req.url
      )
    );
  }

  return NextResponse.redirect(new URL(`/gglesuccess?logged=false`, req.url));
}
