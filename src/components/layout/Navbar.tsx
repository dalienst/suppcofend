"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  User as UserIcon,
  Bell,
  LogOut
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Logic to determine role based on path for styling
  const isContractor = (session?.user as any)?.is_contractor
  const isSupplier = (session?.user as any)?.is_supplier
  
  const roleBg = isContractor 
    ? "bg-jungle-600" 
    : isSupplier 
      ? "bg-suppblue-600" 
      : "bg-slate-900"

  if (pathname === "/login") return null

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-border h-16 px-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded flex items-center justify-center text-white font-bold transition-all", roleBg)}>
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SUPPCO</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/marketplace" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/marketplace" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Marketplace
          </Link>
          {isContractor && (
            <Link 
              href="/contractor/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-jungle-600",
                pathname?.startsWith("/contractor") ? "text-jungle-700" : "text-muted-foreground"
              )}
            >
              Contractor Portal
            </Link>
          )}
          {isSupplier && (
            <Link 
              href="/supplier/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-suppblue-600",
                pathname?.startsWith("/supplier") ? "text-suppblue-700" : "text-muted-foreground"
              )}
            >
              Supplier Portal
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{session.user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {isSupplier ? "Supplier" : "Contractor"}
                </p>
              </div>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", roleBg)}>
                <UserIcon className="w-4 h-4" />
              </div>
              <button 
                onClick={() => signOut()}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-slate-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <Link 
            href="/login"
            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
