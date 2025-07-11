import { cookies } from "next/headers";
import jsonwebtoken, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value as string;
    const decoded = jsonwebtoken.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;
    return Response.json({ exp: decoded.exp, valide: true });
  } catch (err) {
    console.error(err);
    if (err instanceof TokenExpiredError) {
      return Response.json({
        valide: false,
      });
    }
    return Response.json({ error: err }, { status: 500 });
  }
}
