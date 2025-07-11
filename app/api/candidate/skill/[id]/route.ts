import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params;
    const deleted = await prisma.skill.delete({
        where:{
            id
        }
    })
    return Response.json({ id: deleted.id});
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" }, { status: 500 });
  }
}