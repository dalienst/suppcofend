import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isAuthRoute = nextUrl.pathname === "/login"
  const isProtectedRoute = nextUrl.pathname.startsWith("/supplier") || nextUrl.pathname.startsWith("/contractor")

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Role-based protection
  if (nextUrl.pathname.startsWith("/supplier") && req.auth?.user && !(req.auth.user as any).is_supplier) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  if (nextUrl.pathname.startsWith("/contractor") && req.auth?.user && !(req.auth.user as any).is_contractor) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
