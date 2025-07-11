import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

type Result = {
  secure_url: string;
  public_id: string;
  display_name: string;
  format:string
};
type FileUpload = {
  url: string;
  publicId: string;
  chatId: string;
};
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const chatId = formData.get("chatId") as string;

    if (!files.length || !chatId) {
      return Response.json(
        { error: "Missing files or chatId" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = file.stream().getReader();
        const chunks: Uint8Array[] = [];
        const uniqueId = Date.now();
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              const buffer = Buffer.concat(chunks);

              // detect file type for folder or metadata if needed
              //   const mimeType = file.type; // e.g. "application/pdf", "image/png"

              cloudinary.uploader
                .upload_stream(
                  {
                    folder: "imisebenzi",
                    resource_type: "auto", // allows image, pdf, docx, etc.
                    public_id: `${uniqueId}_${file.name.split('.')[0]}`,
                    use_filename: false, // You are using your own name, so no need
                     access_mode: "public"
                  },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  }
                )
                .end(buffer);
            } else {
              chunks.push(value!);
              read();
            }
          });
        }

        read();
      });
    });

    const results = (await Promise.all(uploadPromises)) as Result[];
    const projectFiles: FileUpload[] = results.map((file: Result) => ({
      publicId: file.public_id,
      url: file.secure_url,
      chatId,
      originalName: `${file.display_name.split("_")[1]}.${file.format}`,
    }));
    await prisma.chatMedia.createMany({
      data: projectFiles,
    });
    return Response.json({ created: true, id: chatId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
