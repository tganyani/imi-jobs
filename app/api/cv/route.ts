import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string;

    //Validation
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (!userId) {
      return Response.json({ error: "User ID missing" }, { status: 400 });
    }

    // Get existing CV publicId
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { cvPublicId: true },
    });

    // Convert File → Buffer
    const reader = file.stream().getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);
    const uniqueId = Date.now();

    // Upload NEW CV as IMAGE (PDF-as-image workaround)
    const uploadResult = await new Promise<CloudinaryResult>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "imisebenzi/cv",
              resource_type: "image", //
              public_id: `${uniqueId}_${file.name.replace(".pdf", "")}`,
              format: "pdf", // forces PDF handling
              access_mode: "public",
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as CloudinaryResult);
            }
          )
          .end(buffer);
      }
    );
    //Delete OLD CV (IMAGE)
    if (existingUser?.cvPublicId) {
      const deleted = await cloudinary.uploader.destroy(existingUser.cvPublicId, {
        resource_type: "image",
      });
    }

    //Update DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        cvUrl: uploadResult.secure_url,
        cvPublicId: uploadResult.public_id,
      },
    });

    return Response.json({
      success: true,
      url: uploadResult.secure_url,
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}