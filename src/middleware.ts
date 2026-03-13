import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    // Update session and get user status
    const { user, response } = await updateSession(request);

    const { pathname } = request.nextUrl;

    // Define public routes
    const isPublicRoute =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname.startsWith("/auth/");

    // Redirect Logic
    // 1. If user is NOT authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 2. If user IS authenticated and trying to access login/signup
    if (user && (pathname === "/login" || pathname === "/signup")) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
