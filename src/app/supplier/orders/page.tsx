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
  Receipt,
  Edit2
} from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderItem {
  reference: string
  product_name: string
  product_sku: string
  quantity: number
  price_at_purchase: string | number
  payment_plan: {
    reference: string
    payment_option_name: string
    amount: string | number
  } | null
}

interface OrderDelivery {
  reference: string
  delivery_method: "DELIVERY" | "PICKUP"
  shipping_fee: string | number
  delivery_address: string | null
  recipient_name: string | null
  recipient_phone: string | null
  status: string
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

export default function SupplierOrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Logistics form state
  const [formStatus, setFormStatus] = useState("")
  const [formCarrier, setFormCarrier] = useState("")
  const [formTracking, setFormTracking] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sync logistics form with selected order
  useEffect(() => {
    if (selectedOrder) {
      setFormStatus(selectedOrder.status)
      setFormCarrier(selectedOrder.carrier_details || "")
      setFormTracking(selectedOrder.tracking_number || "")
      setSaveSuccess(false)
      setSaveError(null)
    }
  }, [selectedOrder])

  // 1. Fetch Supplier Orders Ledger
  const { data: ordersData, isLoading, error } = useQuery<Order[]>({
    queryKey: ["supplier-orders"],
    queryFn: async () => {
      const response = await api.get("/api/v1/orders/")
      return response.data.results || response.data
    }
  })

  // 2. Update Order Logistics Mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (variables: { reference: string; status: string; carrier: string; tracking: string }) => {
      const response = await api.patch(`/api/v1/orders/${variables.reference}/`, {
        status: variables.status,
        carrier_details: variables.carrier,
        tracking_number: variables.tracking
      })
      return response.data
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
      // Keep selected order in drawer fresh
      setSelectedOrder(updatedOrder)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
    onError: (err: any) => {
      setSaveError(err.response?.data?.error || "Failed to update order tracking details.")
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
  const pendingLogistics = orders.filter((o) => ["PLACED", "PROCESSING"].includes(o.status.toUpperCase()))
  const inTransit = orders.filter((o) => ["PARTIALLY_DISPATCHED", "DISPATCHED"].includes(o.status.toUpperCase()))
  const completedOrders = orders.filter((o) => o.status.toUpperCase() === "COMPLETED")
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === "ALL" || o.status.toUpperCase() === statusFilter.toUpperCase()

    return matchesSearch && matchesStatus
  })

  const handleSaveLogistics = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setIsSaving(true)
    setSaveError(null)

    updateOrderMutation.mutate(
      {
        reference: selectedOrder.reference,
        status: formStatus,
        carrier: formCarrier,
        tracking: formTracking
      },
      {
        onSettled: () => setIsSaving(false)
      }
    )
  }

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
            PACKAGING
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
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

  return (
    <div className="p-4 sm:p-8 space-y-10 pb-24 mx-auto animate-in fade-in duration-300 relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-jungle-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-suppblue-50 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/supplier/dashboard")}
            className="p-2.5 hover:bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-900 transition-all bg-white/60 backdrop-blur"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-8 h-8 text-jungle-600 shrink-0" />
              Incoming Logistics Orders
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Dispatch orders, manage logistics carrier details, and transition fulfillment status.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        
        {/* Card 1: Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-suppblue-50 text-suppblue-750 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Order Revenue</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                KES {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Aggregated material value
          </div>
        </div>

        {/* Card 2: Pending Packaging */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Packaging</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {pendingLogistics.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Placed or processing order items
          </div>
        </div>

        {/* Card 3: Shipped in Transit */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipped in Transit</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {inTransit.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Out on transport carrier routes
          </div>
        </div>

        {/* Card 4: Fully Cleared */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fully Fulfilled</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {completedOrders.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Handover completed successfully
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
              placeholder="Search reference or contractor..."
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
                  {opt === "PROCESSING" ? "PACKAGING" : opt === "DISPATCHED" ? "IN TRANSIT" : opt === "COMPLETED" ? "FULFILLED" : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-jungle-700 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Loading incoming orders...</p>
          </div>
        )}

        {error && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Failed to Load Orders Ledger</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We experienced a networking error while loading the supplier database. Please reload the page.
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
              <h3 className="font-bold text-slate-900 text-sm">No incoming orders</h3>
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
                  <th className="py-4 px-6">Contractor Client</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Paid Balance</th>
                  <th className="py-4 px-6">Fulfillment Status</th>
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
                          {order.user || "Contractor User"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        {isPickup ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-slate-655 bg-slate-50 border border-slate-200">
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
                          <span className="font-bold text-emerald-650">Escrow Paid: KES {paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          {remaining > 0 ? (
                            <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">
                              Pending: KES {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                          className="text-xs font-semibold text-jungle-750 hover:text-jungle-850 flex items-center gap-1.5"
                        >
                          Manage Order
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

      {/* Details Slide Panel Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white max-w-xl w-full h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300 space-y-8 relative">
            
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-jungle-700" />
                    Dispatch Fulfillment Controls
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono font-semibold">REF: {selectedOrder.reference.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-455 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update & Logistics Form */}
              <form onSubmit={handleSaveLogistics} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-jungle-650" />
                  Logistics & Shipment Details
                </h4>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Shipment parameters updated successfully!
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                    {saveError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Fulfillment Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none cursor-pointer text-slate-900"
                    >
                      <option value="PLACED">Placed (Awaiting processing)</option>
                      <option value="PROCESSING">Packaging (Verification & packing)</option>
                      <option value="DISPATCHED">In Transit (Out for delivery)</option>
                      <option value="COMPLETED">Fulfilled (Delivered & verified)</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Physical delivery only inputs */}
                  {selectedOrder.delivery_detail?.delivery_method === "DELIVERY" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Logistics Carrier */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Logistics Carrier</label>
                        <input
                          type="text"
                          placeholder="e.g. DHL, FedEx, G4S"
                          value={formCarrier}
                          onChange={(e) => setFormCarrier(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-900"
                        />
                      </div>

                      {/* Tracking number */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Tracking Number</label>
                        <input
                          type="text"
                          placeholder="e.g. TRK-2838-XYZ"
                          value={formTracking}
                          onChange={(e) => setFormTracking(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Security PIN warning for delivered orders */}
                  {formStatus === "COMPLETED" && selectedOrder.delivery_detail?.delivery_method === "DELIVERY" && (
                    <div className="p-3 bg-amber-50 border border-amber-250/20 rounded-2xl flex gap-2 text-amber-800 text-[10px] leading-relaxed">
                      <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <strong>Security Handover Warning:</strong> Please ensure your dispatch carrier has received the 6-digit secure handover PIN from the contractor at the construction site before finalizing status to <strong>Fulfilled</strong>!
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isSaving ? "Saving details..." : "Save Shipment Details"}
                </button>
              </form>

              {/* Physical Delivery details */}
              {selectedOrder.delivery_detail?.delivery_method === "DELIVERY" ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-suppblue-750" />
                    Delivery Parameters
                  </span>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-450 font-medium">Recipient Client:</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.delivery_detail.recipient_name || selectedOrder.user}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-455 font-medium">Phone number:</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.delivery_detail.recipient_phone || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-455 font-medium">Physical Site Address:</span>
                      <span className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-150 leading-relaxed font-mono">
                        {selectedOrder.delivery_detail.delivery_address || selectedOrder.delivery_address || "No address specified"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    Contractor Self-Pickup
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This order is configured for physical customer pickup at your hub. The contractor dispatch team will arrive with the order reference.
                  </p>
                </div>
              )}

              {/* Purchased Materials list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordered Materials ({selectedOrder.items.length})</h4>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100">
                  {selectedOrder.items.map((item) => (
                    <div key={item.reference} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.product_sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-950 font-mono">
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
                <span className="text-slate-500">Gross Material Revenue</span>
                <span className="font-bold text-slate-900 font-mono">KES {Number(selectedOrder.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Logistics Shipping Fee</span>
                <span className="font-bold text-slate-900 font-mono">
                  KES {Number(selectedOrder.delivery_detail?.shipping_fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Escrow Paid Upfront</span>
                <span className="font-bold text-emerald-600 font-mono">KES {Number(selectedOrder.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-100 pt-3.5">
                <span className="text-slate-900 font-bold">Aggregate Value</span>
                <span className="font-extrabold text-slate-950 font-mono text-sm">
                  KES {(Number(selectedOrder.total_amount) + Number(selectedOrder.delivery_detail?.shipping_fee || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
