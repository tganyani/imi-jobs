import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

type Result = {
  secure_url: string;
  public_id: string;
};
type Img = {
  url: string;
  publicId: string;
  projectId: string;
};
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string;
    const title = formData.get("title") as string;
    const userId = formData.get("userId") as string;
    if (!files.length) {
      return Response.json(
        { error: "Missing files or projectId" },
        { status: 400 }
      );
    }
    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId,
      },
    });
    if (project && files.length) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = file.stream().getReader();
          // Collect chunks
          const chunks: Uint8Array[] = [];
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                const buffer = Buffer.concat(chunks);
                cloudinary.uploader
                  .upload_stream(
                    {
                      folder: `imisebenzi`,
                      resource_type: "image",
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
      const projectImages: Img[] = results.map((image: Result) => ({
        publicId: image.public_id,
        url: image.secure_url,
        projectId: project.id,
      }));
     await prisma.projectImages.createMany({
        data: projectImages,
      });
    }

    return Response.json({ created: true, id: project.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
