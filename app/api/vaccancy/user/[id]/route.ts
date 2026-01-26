import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobs = await prisma.vaccancy.findMany({
      where: {
        userId: id,
      },
      orderBy:{
        updatedAt:"desc"
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        description: true,
        updatedAt: true,
        city: true,
        country: true,
        salary:true,
        type:true,
        sector:true,
        active:true,
        _count: {
          select: {
            applications: true,
            views: true,
          },
        },
      },
    });
    return Response.json(
      jobs.map(({_count,...rest}:any) => ({
        ...rest,
        views: _count.views,
        nApplications:_count.applications,
      }))
    );
  } catch (err) {
    console.log(err);
    return Response.json({ msg: "error while fetching data" });
  }
}
