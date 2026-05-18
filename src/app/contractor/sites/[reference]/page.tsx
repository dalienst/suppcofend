"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { 
  Warehouse, 
  MapPin, 
  Users, 
  ShoppingBag, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  ShieldAlert,
  Calendar,
  Sparkles,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

// TypeScript Interfaces for the Site Details
interface Product {
  id: number
  name: string
  sku: string
  reference: string
  created_at: string
}

interface Staff {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string | null
  role_name: string | null
  reference: string
}

interface SiteDetail {
  id: string
  name: string
  company: string
  address: string | null
  reference: string
  identity: string
  head: number | null
  head_details: Staff | null
  assigned_staff: Staff[]
  site_products: Product[]
  created_at: string
  updated_at: string
}

export default function ContractorSiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reference = params?.reference as string
  
  const [activeTab, setActiveTab] = useState<"staff" | "products">("staff")

  // Fetch Full Site Details from API
  const { data: site, isLoading, isError } = useQuery<SiteDetail>({
    queryKey: ["contractor-site-detail", reference],
    queryFn: async () => {
      const response = await api.get(`/api/v1/sites/${reference}/`)
      return response.data
    },
    enabled: !!reference
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-jungle-600 mx-auto" />
          <p className="text-slate-500 text-xs font-bold">Resolving physical site coordinates...</p>
        </div>
      </div>
    )
  }

  if (isError || !site) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-lg font-black text-slate-900">Site Coordinates Lost</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          The physical site requested was not found or has been decommissioned from active company logistics.
        </p>
        <button
          onClick={() => router.push("/contractor/sites")}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 mx-auto space-y-8 animate-in fade-in-50 duration-300">
      
      {/* 1. Header & Navigation Back */}
      <div className="space-y-4">
        <Link 
          href="/contractor/sites"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-jungle-600 transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Site Directory
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-jungle-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-jungle-600/20 shrink-0">
              <Warehouse className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{site.name}</h1>
                <span className="bg-jungle-50 text-jungle-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-jungle-100 uppercase tracking-wider shrink-0 mt-1">
                  Active Footprint
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{site.address || "No physical footprint address specified"}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 self-start md:self-auto text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered On:</span>
            </div>
            <div className="font-bold text-slate-800">
              {new Date(site.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Statistical Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Site Manager */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Site Manager / Head</p>
            {site.head_details ? (
              <div>
                <h3 className="font-black text-slate-900 truncate">
                  {site.head_details.first_name} {site.head_details.last_name}
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-0.5 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{site.head_details.email}</span>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-black text-slate-500 text-sm italic">Unassigned</h3>
                <Link
                  href="/contractor/staff"
                  className="text-indigo-600 font-bold hover:underline text-[11px] mt-0.5 inline-block"
                >
                  Assign site manager →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Allocated Workers */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Allocated Personnel</p>
            <h3 className="font-black text-slate-900 text-2xl tracking-tight">
              {site.assigned_staff.length}
            </h3>
            <p className="text-slate-500 text-[11px] font-medium">
              Active corporate staff members assigned here.
            </p>
          </div>
        </div>

        {/* Card 3: Stocked Items */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Stocked Materials</p>
            <h3 className="font-black text-slate-900 text-2xl tracking-tight">
              {site.site_products.length}
            </h3>
            <p className="text-slate-500 text-[11px] font-medium">
              Inventory and project materials logged here.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Multi-Tabbed Allocation Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab("staff")}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm",
              activeTab === "staff"
                ? "bg-white text-slate-900 border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent shadow-none"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Assigned Team Roster ({site.assigned_staff.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm",
              activeTab === "products"
                ? "bg-white text-slate-900 border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent shadow-none"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Site Inventory Stock ({site.site_products.length})</span>
          </button>
        </div>

        {/* Tab 1: Staff Directory */}
        {activeTab === "staff" && (
          <div className="flex-1 p-6">
            {site.assigned_staff.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">No Workers assigned</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Physical operations require assigned workers. Reallocate employee base locations in the staff cockpit.
                  </p>
                </div>
                <Link
                  href="/contractor/staff"
                  className="inline-flex items-center gap-2 text-xs font-bold text-jungle-700 hover:underline mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Manage Staff Assignments
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Username</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Email Card</th>
                      <th className="px-6 py-3.5">Phone Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {site.assigned_staff.map((staff) => (
                      <tr key={staff.reference} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {staff.first_name} {staff.last_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">
                          @{staff.username}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            staff.role_name?.toLowerCase().includes("head") || staff.role_name?.toLowerCase().includes("manager")
                              ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                              : "bg-slate-50 border-slate-100 text-slate-600"
                          )}>
                            {staff.role_name || "Staff Member"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{staff.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {staff.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{staff.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products Directory */}
        {activeTab === "products" && (
          <div className="flex-1 p-6">
            {site.site_products.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Site Stock Empty</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    There are currently no catalog products stocked at this physical location.
                  </p>
                </div>
                <Link
                  href="/contractor/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-jungle-700 hover:underline mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  View Catalogue Products
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Product Name</th>
                      <th className="px-6 py-3.5">SKU Code</th>
                      <th className="px-6 py-3.5">Reference ID</th>
                      <th className="px-6 py-3.5">Stocked Date</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {site.site_products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                          {product.reference}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/contractor/products/${product.reference}`}
                            className="text-jungle-700 hover:underline font-bold"
                          >
                            Inspect Product →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
