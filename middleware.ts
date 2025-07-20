import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { Role } from "./lib/constant";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

const PROTECTED_PATHS = [
  "/api/candidate",
  "/api/project",
  "/api/vaccancy/applicants",
  "/api/vaccancy/apply",

  "/api/vaccancy/letter",
  "/api/vaccancy/like",
  "/api/vaccancy/notif",
  "/api/vaccancy/user",

  "/api/vaccancy/view",
  "/api/candidate",
  "/api/chat",
  "/api/project",
  "/api/room",
];
const candidateRoutes = ["/vaccancy/applied", "/vaccancy/saved"];
const recruiterRoutes = ["/vaccancy/post", "/vaccancy/posted"];
const protectFrontForBoth = ["/profile", "/rooms"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const role = request.cookies.get("role")?.value;
  if (
    protectFrontForBoth.some(
      (path) => request.nextUrl.pathname.startsWith(path) && !accessToken
    )
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (
    candidateRoutes.some(
      (path) =>
        request.nextUrl.pathname.startsWith(path) && role === Role.recruiter
    )
  ) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/vaccancy/posted", request.url));
    } else {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  if (
    recruiterRoutes.some(
      (path) =>
        request.nextUrl.pathname.startsWith(path) && role === Role.candidate
    )
  ) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/vaccancy/applied", request.url));
    } else {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
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
    "/api/vaccancy/applicants/:path*",
    "/api/vaccancy/apply/:path*",
    "/api/vaccancy/letter/:path*",
    "/api/vaccancy/like/:path*",
    "/api/vaccancy/notif/:path*",
    "/api/vaccancy/user/:path*",
    "/api/vaccancy/view/:path*",

    "/vaccancy/applied",
    "/vaccancy/saved",
    "/vaccancy/post",
    "/vaccancy/posted/:path*",
    "/api/candidate/:path*",
    "/api/chat/:path*",
    "/api/project/:path*",
    "/api/room/:path*",
    "/profile/:path*",
    "/rooms/:path*",
  ],
};
