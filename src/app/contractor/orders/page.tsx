"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { useState, useEffect } from "react"
import {
  Package,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Loader2,
  X,
  Calendar,
  Building2,
  Truck,
  Clipboard,
  Check,
  CreditCard,
  TrendingUp,
  Receipt
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Installment {
  installment: number
  amount: string | number
  status: string
  due_date: string
}

interface PaymentPlan {
  reference: string
  payment_option: string
  payment_option_name: string
  amount: string | number
  plan: Installment[]
  deposit_amount: string | number | null
  duration_months: number | null
  total_interest: string | number
}

interface OrderItem {
  reference: string
  product_name: string
  product_sku: string
  quantity: number
  price_at_purchase: string | number
  payment_plan: PaymentPlan | null
}

interface OrderDelivery {
  reference: string
  delivery_method: "DELIVERY" | "PICKUP"
  shipping_fee: string | number
  delivery_address: string | null
  recipient_name: string | null
  recipient_phone: string | null
  status: string
  secure_pin: string | null
  carrier_name: string | null
  tracking_number: string | null
}

interface Order {
  reference: string
  user: string
  company_name: string | null
  company_reference: string | null
  status: string
  total_amount: string | number
  paid_amount: string | number
  delivery_address: string | null
  carrier_details: string | null
  tracking_number: string | null
  items: OrderItem[]
  delivery_detail: OrderDelivery | null
  created_at: string
}

export default function ContractorOrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedPin, setCopiedPin] = useState(false)
  const [payingIndex, setPayingIndex] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Fetch Contractor Split Orders History
  const { data: ordersData, isLoading, error } = useQuery<Order[]>({
    queryKey: ["contractor-orders"],
    queryFn: async () => {
      const response = await api.get("/api/v1/orders/")
      return response.data.results || response.data
    }
  })

  // 2. Pay Installment Mutation
  const payInstallmentMutation = useMutation({
    mutationFn: async (variables: { planReference: string; installmentIndex: number }) => {
      const response = await api.post("/api/v1/payments/initialize/", {
        plan_reference: variables.planReference,
        installment_index: variables.installmentIndex
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to initialize installment payment.")
      setPayingIndex(null)
    }
  })

  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    )
  }

  const orders = ordersData || []

  // Stats Calculations
  const activeOrders = orders.filter((o) =>
    ["PLACED", "PARTIALLY_DISPATCHED", "DISPATCHED", "PROCESSING"].includes(o.status.toUpperCase())
  )
  const completedOrders = orders.filter((o) => o.status.toUpperCase() === "COMPLETED")
  const totalCount = orders.length
  const fulfillmentRate = totalCount > 0 ? Math.round((completedOrders.length / totalCount) * 100) : 100

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.company_name && o.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus =
      statusFilter === "ALL" || o.status.toUpperCase() === statusFilter.toUpperCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250/20">
            FULFILLED
          </span>
        )
      case "PLACED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-250/20">
            PLACED
          </span>
        )
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-250/20">
            PROCESSING
          </span>
        )
      case "PARTIALLY_DISPATCHED":
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-250/20">
            IN TRANSIT
          </span>
        )
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-250/20">
            CANCELLED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200">
            {status}
          </span>
        )
    }
  }

  const copyPinToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin)
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  const handlePayInstallment = (planReference: string, installmentIndex: number) => {
    const key = `${planReference}-${installmentIndex}`
    setPayingIndex(key)
    payInstallmentMutation.mutate({ planReference, installmentIndex })
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 pb-24 max-w-7xl mx-auto animate-in fade-in duration-300 relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-jungle-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-suppblue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/contractor/dashboard")}
            className="p-2.5 hover:bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-900 transition-all bg-white/60 backdrop-blur"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-8 h-8 text-jungle-600 shrink-0" />
              Procurement Orders
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Track delivery progress, payments remaining, and secure verification PINs.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Card 1: Active Shipments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deliveries</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {activeOrders.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            In processing & logistics routes
          </div>
        </div>

        {/* Card 2: Fully Completed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed historical orders</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {completedOrders.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Handover completed successfully
          </div>
        </div>

        {/* Card 3: Fulfillment Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-suppblue-50 text-suppblue-750 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fulfillment Rate</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {fulfillmentRate}%
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Operational pipeline health
          </div>
        </div>

      </div>

      {/* Main Table / Logs Card */}
      <div className="bg-white rounded-3xl border border-slate-255/65 shadow-sm overflow-hidden relative z-10">
        
        {/* Filter Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mr-1 shrink-0">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["ALL", "PLACED", "PROCESSING", "DISPATCHED", "COMPLETED"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === opt ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {opt === "DISPATCHED" ? "IN TRANSIT" : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-jungle-700 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Loading material orders...</p>
          </div>
        )}

        {error && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Failed to Load Orders</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We experienced a networking error while loading your orders ledger. Please reload the page.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No orders found</h3>
              <p className="text-slate-500 text-xs mt-1">
                No orders match your search queries or selected status filters.
              </p>
            </div>
          </div>
        )}

        {/* Table layout */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="py-4 px-6">Order Ref</th>
                  <th className="py-4 px-6">Material Supplier</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Order Total</th>
                  <th className="py-4 px-6">Paid Balance</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Placed</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
                {filteredOrders.map((order) => {
                  const isPickup = order.delivery_detail?.delivery_method === "PICKUP"
                  const total = Number(order.total_amount)
                  const paid = Number(order.paid_amount)
                  const remaining = Math.max(0, total - paid)
                  return (
                    <tr key={order.reference} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-mono font-bold">
                        {order.reference.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          {order.company_name || "Material Supplier"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        {isPickup ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200">
                            Self-Pickup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-suppblue-750 bg-suppblue-50 border border-suppblue-200/40">
                            Delivery
                          </span>
                        )}
                      </td>
                      <td className="py-4.5 px-6 font-mono font-bold">
                        KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4.5 px-6 font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-emerald-650">Paid: KES {paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          {remaining > 0 ? (
                            <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">
                              Due: KES {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded w-max">RECONCILED</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 font-medium">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4.5 px-6">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-semibold text-jungle-700 hover:text-jungle-850 flex items-center gap-1.5"
                        >
                          Inspect Order
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Panel Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white max-w-xl w-full h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300 space-y-8 relative">
            
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-jungle-700" />
                    Order Details
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono font-semibold">REF: {selectedOrder.reference.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Logistics Status Monitor */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fulfillment Pipeline</h4>
                
                {/* Horizontal progress steps */}
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    
                    {/* Active highlighted line bar */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-jungle-600 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width:
                          selectedOrder.status.toUpperCase() === "COMPLETED"
                            ? "100%"
                            : ["PARTIALLY_DISPATCHED", "DISPATCHED"].includes(selectedOrder.status.toUpperCase())
                            ? "66%"
                            : selectedOrder.status.toUpperCase() === "PROCESSING"
                            ? "33%"
                            : "0%"
                      }}
                    />

                    {/* Step Nodes */}
                    {[
                      { status: "PLACED", label: "Placed" },
                      { status: "PROCESSING", label: "Packaging" },
                      { status: "DISPATCHED", label: "In Transit" },
                      { status: "COMPLETED", label: "Fulfilled" }
                    ].map((step, idx) => {
                      const isDone =
                        selectedOrder.status.toUpperCase() === "COMPLETED" ||
                        (step.status === "DISPATCHED" && ["PARTIALLY_DISPATCHED", "DISPATCHED"].includes(selectedOrder.status.toUpperCase())) ||
                        (step.status === "PROCESSING" && ["PROCESSING", "PARTIALLY_DISPATCHED", "DISPATCHED"].includes(selectedOrder.status.toUpperCase())) ||
                        step.status === "PLACED"
                      
                      const isActive = selectedOrder.status.toUpperCase() === step.status || 
                        (step.status === "DISPATCHED" && selectedOrder.status.toUpperCase() === "PARTIALLY_DISPATCHED")

                      return (
                        <div key={step.status} className="flex flex-col items-center gap-1.5 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              isDone
                                ? "bg-jungle-600 border-jungle-600 text-white"
                                : "bg-white border-slate-200 text-slate-400"
                            } ${isActive ? "ring-4 ring-jungle-100" : ""}`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold ${isDone ? "text-slate-800" : "text-slate-400"}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Secure Receipt PIN Banner */}
              {selectedOrder.delivery_detail?.delivery_method === "DELIVERY" &&
                selectedOrder.status.toUpperCase() !== "COMPLETED" && (
                  <div className="bg-jungle-50 border-2 border-jungle-500/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-jungle-650" />
                      <span className="text-xs font-bold text-jungle-850 uppercase tracking-wider">Secure Receipt Handover PIN</span>
                    </div>
                    <div className="flex items-center justify-between bg-white border border-jungle-200/40 rounded-2xl p-4">
                      <span className="text-3xl font-black text-slate-900 tracking-widest font-mono">
                        {selectedOrder.delivery_detail?.secure_pin || "------"}
                      </span>
                      <button
                        onClick={() => selectedOrder.delivery_detail?.secure_pin && copyPinToClipboard(selectedOrder.delivery_detail.secure_pin)}
                        className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700 transition-all active:scale-95"
                      >
                        {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4" />}
                        {copiedPin ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      ⚠️ <strong>Logistics Warning:</strong> Please protect this PIN. Give it strictly to the delivery carrier driver only upon satisfactory physical verification and handover of all materials at the project site.
                    </p>
                  </div>
                )}

              {/* Physical Pickup details */}
              {selectedOrder.delivery_detail?.delivery_method === "PICKUP" && (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-650" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contractor Self-Pickup Instructions</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-500">
                      Please send your logistics dispatch team to pick up the materials at the supplier's fulfillment warehouse:
                    </p>
                    <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fulfillment Hub:</span>
                        <span className="text-slate-900">{selectedOrder.company_name} Warehouse</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verification Ref:</span>
                        <span className="text-slate-900 font-mono">{selectedOrder.reference.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Carrier Details */}
              {selectedOrder.delivery_detail?.carrier_name && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carrier & Tracking Details</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Logistics Carrier</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.delivery_detail.carrier_name}</span>
                    </div>
                    <div className="p-4 flex justify-between">
                      <span className="text-slate-500">Tracking Reference</span>
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        {selectedOrder.delivery_detail.tracking_number || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Installment Schedules (Balance Payment Panel) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-suppblue-750" />
                  Installment Payment Schedule
                </h4>

                <div className="space-y-3">
                  {selectedOrder.items.map((item) => {
                    const plan = item.payment_plan
                    if (!plan || !plan.plan) return null

                    return (
                      <div key={item.reference} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                              {item.product_name}
                            </span>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              Plan Option: {plan.payment_option_name}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            Total: KES {Number(plan.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* List of installments */}
                        <div className="space-y-2 bg-white border border-slate-150 rounded-2xl p-3">
                          {plan.plan.map((inst, idx) => {
                            const isPaid = inst.status.toUpperCase() === "PAID"
                            const installmentKey = `${plan.reference}-${idx}`
                            const isCurrentPaying = payingIndex === installmentKey

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100 text-xs font-semibold"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-slate-800">
                                    Installment #{inst.installment}
                                  </span>
                                  <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {new Date(inst.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4">
                                  <span className="font-mono font-bold text-slate-900">
                                    KES {Number(inst.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>

                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      PAID
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handlePayInstallment(plan.reference, idx)}
                                      disabled={payingIndex !== null}
                                      className="px-3 py-1.5 bg-suppblue-700 hover:bg-suppblue-850 text-white rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                      {isCurrentPaying ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CreditCard className="w-3 h-3" />
                                      )}
                                      {isCurrentPaying ? "Billing..." : "Pay"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Materials list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purchased Materials ({selectedOrder.items.length})</h4>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100">
                  {selectedOrder.items.map((item) => (
                    <div key={item.reference} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.product_sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-955 font-mono">
                          {item.quantity} Qty
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          KES {Number(item.price_at_purchase).toLocaleString(undefined, { minimumFractionDigits: 2 })} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Total Aggregate payment summary */}
            <div className="space-y-3.5 border-t border-slate-100 pt-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Gross Subtotal</span>
                <span className="font-bold text-slate-900 font-mono">KES {Number(selectedOrder.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Escrow Paid Upfront</span>
                <span className="font-bold text-emerald-600 font-mono">KES {Number(selectedOrder.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Remaining Financed Balance</span>
                <span className="font-bold text-slate-500 font-mono">
                  KES {Math.max(0, Number(selectedOrder.total_amount) - Number(selectedOrder.paid_amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
