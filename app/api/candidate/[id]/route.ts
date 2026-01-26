import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }>  }
) {
  const { id } = await params;
  try {
    return Response.json(
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          name: true,
          email: true,
          position: true,
          bio: true,
          country: true,
          city: true,
          eduction: true,
          skills: true,
          languages:true,
          employmentHistory: true,
          active: true,
          image: true,
          imagePublicId: true,
          phone: true,
          linkedInn: true,
          faceBook: true,
          website: true,
          telegram: true,
          whatsapp: true,
          companyInfo: true,
          companyName: true,
          address: true,
          cvUrl:true,
          cvPublicId:true,
          projects: {
            include: {
              images: {
                select: {
                  publicId: true,
                  url: true,
                },
              },
            },
          },
        },
      })
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();

    const { id } = await params;
    const data = await req.json();
    if (data.role) {
      cookieStore.set("role", data.role, {
        httpOnly: true,
        secure: true,
      });
    }
    const update = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return Response.json({ id: update.id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}
