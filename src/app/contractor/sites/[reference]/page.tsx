"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { 
  Building2, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Users,
  Package,
  ArrowLeft,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Warehouse,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContractorSiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reference = params.reference as string

  const [activeTab, setActiveTab] = useState<"staff" | "stock">("staff")

  const { data: site, isLoading, error } = useQuery({
    queryKey: ["contractor-site", reference],
    queryFn: async () => {
      const response = await api.get(`/api/v1/sites/${reference}/`)
      return response.data
    },
    enabled: !!reference
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-jungle-600" />
        <p className="text-slate-500 font-bold text-sm">Loading site coordinates...</p>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex flex-col items-center text-center space-y-3">
          <AlertCircle className="w-10 h-10" />
          <h2 className="text-xl font-black">Site Not Found</h2>
          <p className="text-sm">The construction site you are looking for does not exist or you lack permission.</p>
          <button 
            onClick={() => router.push("/contractor/sites")}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Return to Directory
          </button>
        </div>
      </div>
    )
  }

  const staff = site.assigned_staff || []
  const stock = site.site_products || []
  const manager = site.head_details

  return (
    <div className="p-4 mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
        <Link href="/contractor/sites" className="hover:text-jungle-600 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Sites Directory
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900">{site.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-jungle-600 to-jungle-800"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-xl border border-slate-100 flex items-center justify-center text-jungle-600 shrink-0">
                <Warehouse className="w-12 h-12" />
              </div>
              <div className="space-y-1 pb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{site.name}</h1>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {site.address || "No physical address provided"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Registered {new Date(site.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-xl bg-jungle-100 text-jungle-700 flex items-center justify-center font-black text-xl shrink-0">
                {manager ? manager.first_name?.[0] : "?"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Site Manager</p>
                <p className="font-bold text-slate-900 truncate">
                  {manager ? `${manager.first_name} ${manager.last_name}` : "Unassigned"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {manager ? manager.email : "No manager allocated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("staff")}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === "staff" 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <Users className="w-4 h-4" />
          Assigned Team ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === "stock" 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <Package className="w-4 h-4" />
          Site Inventory ({stock.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === "staff" && (
          <div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900">Team Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">Personnel currently allocated to {site.name}.</p>
              </div>
            </div>
            {staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">No team members assigned</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">Allocate employees to this site from the main staff management cockpit.</p>
                </div>
                <Link href="/contractor/staff" className="text-sm font-bold text-jungle-600 hover:text-jungle-700 transition-colors">
                  Go to Staff Directory &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {staff.map((member: any) => (
                  <div key={member.username} className="border border-slate-100 rounded-2xl p-5 flex gap-4 hover:border-jungle-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-jungle-100 group-hover:text-jungle-700 transition-colors">
                      {member.first_name?.[0] || member.username[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">{member.first_name} {member.last_name}</p>
                      <p className="text-xs text-slate-500 truncate mb-2">@{member.username}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {member.account_type || "Standard"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stock" && (
          <div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900">Equipment & Supplies</h3>
                <p className="text-xs text-slate-500 mt-0.5">Catalogue tracking for materials stored at this site.</p>
              </div>
            </div>
            {stock.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">No stock tracked here</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">Products and equipment listed or procured for this site will appear here automatically.</p>
                </div>
                <Link href="/contractor/products" className="text-sm font-bold text-jungle-600 hover:text-jungle-700 transition-colors">
                  Go to Products &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">SKU / Code</th>
                      <th className="px-6 py-4 text-right">Stock Quantity</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stock.map((item: any) => (
                      <tr key={item.reference} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          {item.quantity} units
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/contractor/products/${item.reference}`}
                            className="text-xs font-bold text-jungle-600 hover:text-jungle-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Inspect &rarr;
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
