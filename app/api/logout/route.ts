import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");

    cookieStore.delete("refresh_token");

    return Response.json({
      logout: true,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "error" });
  }
}
