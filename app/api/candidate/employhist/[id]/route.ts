import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params:Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const update = await prisma.employmentHistory.update({
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
