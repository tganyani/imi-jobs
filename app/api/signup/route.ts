import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationCode } from "generate-verification-code";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/emailVerification";

export async function POST(req: NextRequest) {
  const { email, password, name,role } = await req.json();
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        verified: true,
      },
    });
    if (existingUser) {
      return  Response.json({err:"Email already in use",created:false});
    }
    const unverifiedUser = await prisma.user.findFirst({
      where: {
        email,
        verified: false,
      },
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode({
      length: 6,
      type: "string",
    });
    const hashedVerificationCode = await bcrypt.hash(
      verificationCode as string,
      10
    );
    if (unverifiedUser) {
      await sendVerificationEmail(email, verificationCode as string);
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          verificationCode: hashedVerificationCode,
           password: hashedPassword,
        },
      });
      return Response.json({
        msg: "Verification code sent to email",
        created: true,
        email,
        err:""
      });
    }
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationCode: hashedVerificationCode,
        name,
        role
      },
    });
    await sendVerificationEmail(email, verificationCode as string);
    return Response.json({
      msg: "Verification code sent to email",
      created: true,
      email,
      id: user.id,
      err:""
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "error" });
  }
}
