import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const vaccancyId = searchParams.get("vaccancyId") as string;
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
           languages:true,
          jobsProposed: {
            where: {
              vaccancyId,
            },
            select: {
              vaccancyId: true,
            },
          },
          jobsApplied: {
            where: {
              vaccancyId,
            },
            select: {
              status: true,
              id: true,
            },
          },
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const update = await prisma.application.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return Response.json({
      updated: true,
      id: update.id,
    });
  } catch (err) {
    console.log(err);
    return Response.json({ error: true });
  }
}
