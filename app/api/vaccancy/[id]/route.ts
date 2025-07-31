import { FbJobFeed } from "@/lib/fbJob";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params:Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.vaccancy.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        type: true,
        city: true,
        country: true,
        description: true,
        updatedAt: true,
        salary: true,
        sector: true,
        active: true,
        user: {
          select: {
            email: true,
            id: true,
            companyInfo:true,
          },
        },
        _count: {
          select: {
            applications: true,
            views: true,
          },
        },
        applications: {
          select: {
            userId: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });
    return Response.json({
      id: job?.id,
      title: job?.title,
      companyName: job?.companyName,
      type: job?.type,
      city: job?.city,
      country: job?.country,
      description: job?.description,
      updatedAt: job?.updatedAt,
      salary: job?.salary,
      sector: job?.sector,
      nApplications: job?._count.applications,
      applications: job?.applications,
      likes: job?.likes,
      user: job?.user,
      nViews: job?._count.views,
      active:job?.active
    });
  } catch (err) {
    console.log(err);
    return Response.json({ msg: "error while fetching data" });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await prisma.vaccancy.update({
      where: {
        id,
      },
      data,
    });
    await FbJobFeed(updated)
    return Response.json({ updated: true, id: updated.id });
  } catch (err) {
    console.log(err);
    return Response.json({ msg: "error while fetching data" });
  }
}
