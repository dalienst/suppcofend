"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  CreditCard,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
  FileText
} from "lucide-react"

// TypeScript Interfaces matching API response shapes
interface OrderItem {
  reference: string
  product_name: string
  product_sku: string
  product_company: string
  quantity: string | number
  price_at_purchase: string | number
  status: string
}

interface Order {
  reference: string
  status: string
  total_amount: string | number
  paid_amount: string | number
  delivery_address: string | null
  items: OrderItem[]
  created_at: string
}

interface Site {
  id: number
  reference: string
  name: string
  address: string | null
  created_at: string
}

export default function ContractorDashboard() {
  const router = useRouter()

  // 1. Fetch Contractor Sites
  const { data: sites, isLoading: isLoadingSites } = useQuery<Site[]>({
    queryKey: ["contractor-sites"],
    queryFn: async () => {
      const response = await api.get("/api/v1/sites/")
      return response.data.results || response.data
    }
  })

  // 2. Fetch Contractor Orders
  const { data: orders, isLoading: isLoadingOrders, error } = useQuery<Order[]>({
    queryKey: ["contractor-orders"],
    queryFn: async () => {
      const response = await api.get("/api/v1/orders/")
      return response.data.results || response.data
    }
  })

  const isLoading = isLoadingSites || isLoadingOrders

  // Calculations based on dynamic data
  const totalSitesCount = sites?.length || 0

  const activeOrders = orders?.filter(o => 
    !["DRAFT", "COMPLETED", "CANCELLED"].includes(o.status.toUpperCase())
  ) || []

  const completedOrders = orders?.filter(o => 
    o.status.toUpperCase() === "COMPLETED"
  ) || []

  // Sum of outstanding amounts across all orders
  const totalOutstanding = orders?.reduce((acc, order) => {
    const total = Number(order.total_amount) || 0
    const paid = Number(order.paid_amount) || 0
    return acc + Math.max(0, total - paid)
  }, 0) || 0

  // Filter orders that have pending payment (total_amount > paid_amount)
  const outstandingOrders = orders?.filter(order => {
    const total = Number(order.total_amount) || 0
    const paid = Number(order.paid_amount) || 0
    return total > paid
  }).slice(0, 3) || []

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PLACED":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "PARTIALLY_DISPATCHED":
      case "DISPATCHED":
        return "text-indigo-700 bg-indigo-50 border-indigo-200"
      case "PROCESSING":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "COMPLETED":
        return "text-emerald-700 bg-emerald-50 border-emerald-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-jungle-600 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Aggregating procurement matrices...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Dashboard Interrupted</h2>
        <p className="text-slate-500 text-xs leading-relaxed">
          We encountered an issue fetching your project analytics. Please reload the page or contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 pb-24 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-jungle-600 shrink-0" />
            Procurement Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time logistical visibility across your active site operations.
          </p>
        </div>
        <Link
          href="/marketplace"
          className="px-6 py-3.5 bg-jungle-700 hover:bg-jungle-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-jungle-700/10 hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          Procure Materials
        </Link>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Shipments */}
        <div 
          onClick={() => router.push("/contractor/orders")}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-jungle-50 text-jungle-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Orders</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{activeOrders.length}</h2>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 text-xs font-semibold text-jungle-600 flex items-center gap-1">
            {completedOrders.length} orders completed historically
          </div>
        </div>

        {/* Card 2: Outstanding Balance */}
        <div 
          onClick={() => router.push("/contractor/payments")}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1 font-mono">
                KES {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 text-xs font-semibold text-amber-600">
            {outstandingOrders.length} plans requiring installment payments
          </div>
        </div>

        {/* Card 3: Active Sites */}
        <div 
          onClick={() => router.push("/contractor/sites")}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-suppblue-50 text-suppblue-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-355 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Footprints</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{totalSitesCount}</h2>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 text-xs font-semibold text-suppblue-600 flex items-center gap-1">
            Manage your physical operations map
          </div>
        </div>

      </div>

      {/* Shipments & Ledger Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Track Active Shipments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Shipments</h2>
            <Link 
              href="/contractor/orders" 
              className="text-xs font-bold text-jungle-750 hover:text-jungle-850 flex items-center gap-1 hover:underline"
            >
              All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {!activeOrders || activeOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-xs font-bold">No active material shipments</p>
                <Link
                  href="/marketplace"
                  className="text-jungle-700 hover:underline font-bold text-xs inline-block"
                >
                  Order items from Marketplace &rarr;
                </Link>
              </div>
            ) : (
              activeOrders.slice(0, 4).map((order) => {
                const firstItem = order.items?.[0]
                const itemName = firstItem 
                  ? `${firstItem.product_name} (${Number(firstItem.quantity)} Units)`
                  : "Materials Order"
                const supplierName = firstItem?.product_company || "Direct Supplier"
                const itemTotalCount = order.items?.length || 1

                return (
                  <div 
                    key={order.reference} 
                    onClick={() => router.push(`/contractor/orders`)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-jungle-550 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-jungle-50 text-jungle-650 rounded-xl flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{itemName}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {supplierName} &bull; {order.reference.substring(0, 8)}
                          {itemTotalCount > 1 && ` (+${itemTotalCount - 1} other items)`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold tracking-wider font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Dynamic Payment Plans Tracker */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Payments</h2>
            <Link 
              href="/contractor/payments" 
              className="text-xs font-bold text-jungle-750 hover:text-jungle-850 flex items-center gap-1 hover:underline"
            >
              Reconciliation <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative min-h-[220px] flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            
            {!outstandingOrders || outstandingOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 relative z-10 py-6">
                <div className="w-12 h-12 rounded-full bg-white/5 text-white/50 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-slate-450 text-xs font-bold">All payments fully cleared!</p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {outstandingOrders.map((pmt) => {
                  const firstItem = pmt.items?.[0]
                  const itemName = firstItem?.product_name || "Procurement Materials"
                  const totalVal = Number(pmt.total_amount) || 0
                  const paidVal = Number(pmt.paid_amount) || 0
                  const outstanding = totalVal - paidVal

                  return (
                    <div 
                      key={pmt.reference} 
                      onClick={() => router.push("/contractor/payments")}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all border border-white/5 rounded-2xl group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-jungle-400 text-slate-950 rounded-xl flex items-center justify-center font-black text-xs shrink-0 font-mono">
                          KES
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white font-mono">
                            KES {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate mt-0.5">{itemName}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-jungle-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest mt-1.5 inline-block transition-colors">
                          Pay Now &rarr;
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
