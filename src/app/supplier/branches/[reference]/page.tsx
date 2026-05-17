"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { 
  Building2, 
  MapPin, 
  Users, 
  ShoppingBag, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  ShieldAlert,
  User,
  Calendar,
  Layers,
  Sparkles,
  UserCheck
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// TypeScript Interfaces for the Branch Details
interface Product {
  id: number
  name: string
  sku: string
  reference: string
  created_at: string
}

interface Staff {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string | null
  role_name: string | null
}

interface BranchDetail {
  id: number
  name: string
  company: string
  address: string | null
  reference: string
  identity: string
  head: number | null
  head_details: Staff | null
  assigned_staff: Staff[]
  branch_products: Product[]
  created_at: string
  updated_at: string
}

export default function SupplierBranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const reference = params?.reference as string
  
  const [activeTab, setActiveTab] = useState<"staff" | "products">("staff")

  // Fetch Full Branch Details from API
  const { data: branch, isLoading, isError } = useQuery<BranchDetail>({
    queryKey: ["supplier-branch-detail", reference],
    queryFn: async () => {
      const response = await api.get(`/api/v1/branches/${reference}/`)
      return response.data
    },
    enabled: !!reference
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-suppblue-600 mx-auto" />
          <p className="text-slate-500 text-xs font-bold">Resolving physical branch coordinates...</p>
        </div>
      </div>
    )
  }

  if (isError || !branch) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-lg font-black text-slate-900">Branch Coordinates Lost</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          The physical branch requested was not found or has been decommissioned from active company logistics.
        </p>
        <button
          onClick={() => router.push("/supplier/branches")}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 mx-auto space-y-8 max-w-7xl animate-in fade-in-50 duration-300">
      
      {/* 1. Header & Navigation Back */}
      <div className="space-y-4">
        <Link 
          href="/supplier/branches"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-suppblue-600 transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Branch Directory
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-suppblue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-suppblue-600/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{branch.name}</h1>
                <span className="bg-suppblue-50 text-suppblue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-suppblue-100 uppercase tracking-wider shrink-0 mt-1">
                  Active Coordinates
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{branch.address || "No physical address specified"}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-5 py-3.5 self-start md:self-auto text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered On:</span>
            </div>
            <div className="font-bold text-slate-800">
              {new Date(branch.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Statistical Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Branch Manager */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Branch Manager / Head</p>
            {branch.head_details ? (
              <div>
                <h3 className="font-black text-slate-900 truncate">
                  {branch.head_details.first_name} {branch.head_details.last_name}
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-0.5 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{branch.head_details.email}</span>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-black text-slate-500 text-sm italic">Unassigned</h3>
                <Link
                  href="/supplier/staff"
                  className="text-indigo-600 font-bold hover:underline text-[11px] mt-0.5 inline-block"
                >
                  Assign branch manager →
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
              {branch.assigned_staff.length}
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
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Stocked Products</p>
            <h3 className="font-black text-slate-900 text-2xl tracking-tight">
              {branch.branch_products.length}
            </h3>
            <p className="text-slate-500 text-[11px] font-medium">
              Industrial catalogue products linked here.
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
            <span>Assigned Team Roster ({branch.assigned_staff.length})</span>
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
            <span>Stock Catalogue ({branch.branch_products.length})</span>
          </button>
        </div>

        {/* Tab 1: Staff Directory */}
        {activeTab === "staff" && (
          <div className="flex-1 p-6">
            {branch.assigned_staff.length === 0 ? (
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
                  href="/supplier/staff"
                  className="inline-flex items-center gap-2 text-xs font-bold text-suppblue-700 hover:underline mx-auto"
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
                    {branch.assigned_staff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
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
            {branch.branch_products.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Branch Stock Empty</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    There are currently no catalog products stocked at this physical location.
                  </p>
                </div>
                <Link
                  href="/supplier/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-suppblue-700 hover:underline mx-auto"
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
                    {branch.branch_products.map((product) => (
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
                            href={`/supplier/products/${product.reference}`}
                            className="text-suppblue-700 hover:underline font-bold"
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
