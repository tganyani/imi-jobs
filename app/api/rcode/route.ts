import { sendVerificationEmail } from "@/lib/emailVerification";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "generate-verification-code/dist";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    try {
    const {email} = await req.json()
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return Response.json({ error: "wrong email" })
        const verificationCode = generateVerificationCode({
          length: 6,
          type: "string",
        });
        const hashedVerificationCode = await bcrypt.hash(verificationCode as string, 10);
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            verificationCode: hashedVerificationCode,
          },
        });
  
        await sendVerificationEmail(email, verificationCode as string);
        return Response.json({ message: "Verification code sent to email", codeSend: true ,email,error: ""});
      } catch (err) {
        console.error(err);
        return Response.json({ error: "error" },{status:500});
      } 
}
