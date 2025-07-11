// app/api/upload/route.ts
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UploadApiResponse } from "cloudinary";

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") ;
    const id = formData.get("id") as string;
    if (!(file instanceof File) || file.size === 0) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user?.imagePublicId) {
        await cloudinary.uploader.destroy(user?.imagePublicId as string);
        await prisma.user.update({
        where: {
          id,
        },
        data: {
          image: null,
          imagePublicId: null,
        },
      });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    } else {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          image: null,
          imagePublicId: null,
        },
      });
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "imisebenzi", // optional folder name
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          )
          .end(buffer);
      });
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          image: result.secure_url,
          imagePublicId: result.public_id,
        },
      });
      return NextResponse.json({ success: true, id: result.public_id });
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
