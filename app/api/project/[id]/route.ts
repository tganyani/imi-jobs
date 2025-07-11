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
type Ids = { publicId: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string;
    const title = formData.get("title") as string;
    const deletedIds = JSON.parse(formData.get("deletedIds") as string);
    const idsToDelete: string[] = deletedIds
      .map((img: Ids) => img.publicId)
      .filter(Boolean); // removes undefined, null, ""

    const updated = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title,
        description,
      },
    });

    if (deletedIds.length) {
      await prisma.projectImages.deleteMany({
        where: {
          publicId: { in: idsToDelete },
        },
      });
      const deleteResults = await Promise.allSettled(
        deletedIds.map((publicId: string) =>
          cloudinary.uploader.destroy(publicId)
        )
      );

      deleteResults.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.warn(`Failed to delete ${deletedIds[idx]}`, result.reason);
        }
      });
    }

    if (updated && files.length) {
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
        projectId: updated.id,
      }));
      await prisma.projectImages.createMany({
        data: projectImages,
      });
    }

    return Response.json({ updated: true, id: updated.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
