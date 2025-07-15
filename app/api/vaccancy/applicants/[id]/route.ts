import { ApplicationStatus } from "@/lib/constant";
import {
  sendApplicationInvitationEmail,
  sendApplicationRejectionEmail,
} from "@/lib/email";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const vaccancyId = searchParams.get("vaccancyId") as string;
  try {
    const user = await prisma.user.findUnique({
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
        languages: true,
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
            user: {
              select: {
                rooms: {
                  include: {
                    users: true,
                  },
                },
              },
            },
            vaccancy: {
              select: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
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
    });
    return Response.json({
      ...user,
      jobsApplied: user?.jobsApplied[0]?.id
        ? [{
            id: user?.jobsApplied[0].id,
            status: user?.jobsApplied[0].status,
            roomName: user?.jobsApplied[0].user.rooms.filter((rm) =>
              rm.users.some(
                (usr) => usr.id === user?.jobsApplied[0].vaccancy.user.id
              )
            )[0].name,
            roomId: user?.jobsApplied[0].user.rooms.filter((rm) =>
              rm.users.some(
                (usr) => usr.id === user?.jobsApplied[0].vaccancy.user.id
              )
            )[0].id,
          }]
        : [],
    });
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
    const { id } = await params;
    const { status } = await req.json();

    const update = await prisma.application.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        vaccancy: {
          select: {
            title: true,
            companyName: true,
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (status === ApplicationStatus.invited) {
      // (email:string,jobTitle:string , companyName:string,candidate:string,recruiter:string)

      await sendApplicationInvitationEmail(
        update.user.email,
        update.vaccancy.title,
        update.vaccancy.companyName,
        update.user.name,
        update.vaccancy.user.name,
        update.vaccancy.id
      );
    } else {
      await sendApplicationRejectionEmail(
        update.user.email,
        update.vaccancy.title,
        update.vaccancy.companyName,
        update.user.name,
        update.vaccancy.user.name
      );
    }
    return Response.json({
      updated: true,
      id: update.id,
    });
  } catch (err) {
    console.log(err);
    return Response.json({ error: true });
  }
}
