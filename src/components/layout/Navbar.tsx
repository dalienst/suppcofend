"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  ShoppingBag, 
  Store, 
  LayoutDashboard, 
  User as UserIcon,
  Bell
} from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  
  // Logic to determine role based on path for styling
  const isContractor = pathname?.includes("/contractor")
  const isSupplier = pathname?.includes("/supplier")
  
  const roleColor = isContractor 
    ? "text-jungle-600 border-jungle-600" 
    : isSupplier 
      ? "text-suppblue-600 border-suppblue-600" 
      : "text-primary border-primary"

  const roleBg = isContractor 
    ? "bg-jungle-600" 
    : isSupplier 
      ? "bg-suppblue-600" 
      : "bg-primary"

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-border h-16 px-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded flex items-center justify-center text-white font-bold", roleBg)}>
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
          <Link 
            href="/contractor/dashboard" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-jungle-600",
              isContractor ? "text-jungle-700" : "text-muted-foreground"
            )}
          >
            Contractor Portal
          </Link>
          <Link 
            href="/supplier/dashboard" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-suppblue-600",
              isSupplier ? "text-suppblue-700" : "text-muted-foreground"
            )}
          >
            Supplier Portal
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1" />
        <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900">John Doe</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Contractor</p>
          </div>
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", roleBg)}>
            <UserIcon className="w-4 h-4" />
          </div>
        </button>
      </div>
    </nav>
  )
}
