import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isAuthRoute = ["/login", "/signup", "/password/reset", "/password/new"].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/signup/")
  const isPublicRoute = ["/", "/marketplace", "/verify-email"].some(path => nextUrl.pathname.startsWith(path))
  
  const isSupplierRoute = nextUrl.pathname.startsWith("/supplier")
  const isContractorRoute = nextUrl.pathname.startsWith("/contractor")

  // 1. Redirect logged-in users away from auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      const isSupplier = (req.auth?.user as any)?.is_supplier
      return NextResponse.redirect(new URL(isSupplier ? "/supplier/dashboard" : "/contractor/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // 2. Protect Supplier routes
  if (isSupplierRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl))
    if (!(req.auth?.user as any)?.is_supplier) return NextResponse.redirect(new URL("/", nextUrl))
    return NextResponse.next()
  }

  // 3. Protect Contractor routes
  if (isContractorRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl))
    if (!(req.auth?.user as any)?.is_contractor) return NextResponse.redirect(new URL("/", nextUrl))
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
