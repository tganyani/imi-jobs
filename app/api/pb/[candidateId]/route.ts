import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ candidateId: string }>  }
) {
  const { candidateId} = await params;
  try {
    return Response.json(
      await prisma.user.findUnique({
        where: {
          id:candidateId,
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
