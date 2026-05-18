"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Truck, 
  Settings, 
  Users,
  CreditCard,
  FileText,
  Warehouse,
  ChevronRight,
  Building2,
  Briefcase,
  ShieldCheck,
  PackageSearch
} from "lucide-react"

interface SidebarProps {
  role?: "supplier" | "contractor" | "none"
}

export function Sidebar({ role = "none" }: SidebarProps) {
  const pathname = usePathname()
  
  const contractorLinks = [
    { name: "Overview", href: "/contractor/dashboard", icon: LayoutDashboard },
    { name: "Business Profile", href: "/contractor/company", icon: Building2 },
    { name: "Sites Mgmt", href: "/contractor/sites", icon: Warehouse },
    { name: "Inventory", href: "/contractor/inventory", icon: PackageSearch },
    { name: "Roles", href: "/contractor/roles", icon: ShieldCheck },
    { name: "Products", href: "/contractor/products", icon: Package },
    { name: "Staff", href: "/contractor/staff", icon: Users },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "My Orders", href: "/contractor/orders", icon: Truck },
    { name: "Payments", href: "/contractor/payments", icon: CreditCard },
  ]

  const supplierLinks = [
    { name: "Overview", href: "/supplier/dashboard", icon: LayoutDashboard },
    { name: "Business Profile", href: "/supplier/company", icon: Building2 },
    { name: "Branch Mgmt", href: "/supplier/branches", icon: Warehouse },
    { name: "Payment Options", href: "/supplier/payment-options", icon: CreditCard },
    { name: "Inventory", href: "/supplier/inventory", icon: PackageSearch },
    { name: "Roles", href: "/supplier/roles", icon: ShieldCheck },
    { name: "Products", href: "/supplier/products", icon: Package },
    { name: "Staff", href: "/supplier/staff", icon: Users },
  ]

  const links = role === "supplier" ? supplierLinks : role === "contractor" ? contractorLinks : []

  if (role === "none") return null

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-1">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {role} Menu
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? role === "contractor" 
                    ? "bg-jungle-50 text-jungle-700" 
                    : "bg-suppblue-50 text-suppblue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon className={cn(
                "w-5 h-5",
                isActive 
                  ? role === "contractor" ? "text-jungle-600" : "text-suppblue-600"
                  : "text-slate-400 group-hover:text-slate-600"
              )} />
              {link.name}
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto p-4 border-t border-slate-100">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
