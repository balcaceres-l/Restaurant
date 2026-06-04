import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ROLES, ROLE_HOME_PATHS } from "@/lib/constants/roles";

const SECTION_ROLE: { prefix: string; role: string }[] = [
  { prefix: "/admin", role: ROLES.ADMIN },
  { prefix: "/caja", role: ROLES.CAJERO },
  { prefix: "/cocina", role: ROLES.COCINA },
];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { pathname } = request.nextUrl;
  const role = session.user.role ?? "";
  const section = SECTION_ROLE.find((s) => pathname.startsWith(s.prefix));

  if (section && role !== section.role) {
    const home = ROLE_HOME_PATHS[role as keyof typeof ROLE_HOME_PATHS] ?? "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/caja/:path*", "/cocina/:path*"],
};
