import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { Role } from "./lib/constant";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

const PROTECTED_PATHS = ["/api/candidate", "/api/project", "/api/vaccancy"];
const candidateRoutes = ["/vaccancy/applied", "/vaccancy/saved"];
const recruiterRoutes = ["/vaccancy/post", "/vaccancy/posted"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const role = request.cookies.get("role")?.value;

  if (
    candidateRoutes.some(
      (path) =>
        request.nextUrl.pathname.startsWith(path) && role === Role.recruiter
    )
  ) {
    return NextResponse.redirect(new URL("/vaccancy/posted", request.url));
  }
if (
    recruiterRoutes.some(
      (path) =>
        request.nextUrl.pathname.startsWith(path) && role === Role.candidate
    )
  ) {
    return NextResponse.redirect(new URL("/vaccancy/applied", request.url));
  }

  // Allow public routes through
  if (
    !PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  try {
    // Verify access token
    await jwtVerify(accessToken!, ACCESS_SECRET);
    return NextResponse.next(); //  Valid token
  } catch (err) {
    // Access token invalid or expired
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);

        // Create new access token
        const newAccessToken = await new SignJWT({ id: payload.id })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("15m")
          .sign(ACCESS_SECRET);

        // Attach refreshed token
        const response = NextResponse.next();
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
        });

        return response;
      } catch (refreshErr) {
        //  Refresh token invalid

        console.error("Refresh token error:", refreshErr);
        // return NextResponse.redirect(new URL('/signin', request.url));
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // No valid tokens
    console.error("Access token error:", err);
    // return NextResponse.redirect(new URL('/signin', request.url));
    return new Response("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/candidate/:path*",
    "/api/project/:path*",
    "/api/vaccancy/:path*",
    "/vaccancy/:path*",
  ],
};
