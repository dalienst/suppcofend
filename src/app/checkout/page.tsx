"use client"

import { useCartStore, CartItem } from "@/lib/store"
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Package,
  ChevronRight,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdOrders, setCreatedOrders] = useState<any[] | null>(null)

  // Fetch operational contractor sites from the database
  const { data: sites } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await api.get("/api/v1/sites/")
      return response.data.results || response.data
    }
  })

  const [selectedSite, setSelectedSite] = useState<string>("")
  const [deliveryAddress, setDeliveryAddress] = useState<string>("")

  // Check if any cart item has a flexible plan
  const flexibleItem = items.find((item: CartItem) => item.deposit_amount !== undefined)

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // 1. Sync local Zustand cart with the backend database
      // First, fetch existing backend cart items to clear them out
      const existingRes = await api.get("/api/v1/cartitems/")
      const existingItems = existingRes.data.results || existingRes.data

      for (const item of existingItems) {
        await api.delete(`/api/v1/cartitems/${item.reference}/`)
      }

      // Upload each frontend item to the backend database
      for (const item of items) {
        await api.post("/api/v1/cartitems/", {
          product: item.reference,
          quantity: item.quantity,
          payment_option: item.paymentOptionReference,
          deposit_amount: item.deposit_amount,
          duration_months: item.duration_months,
          monthly_amount: item.monthly_amount
        })
      }

      // 2. Dispatch checkout call to split orders per supplier
      const checkoutRes = await api.post("/api/v1/orders/checkout/")

      // Store the resulting split orders for display
      setCreatedOrders(checkoutRes.data)
      clearCart()
    } catch (err: any) {
      console.error(err)
      setErrorMessage(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "An unexpected error occurred during procurement validation. Please verify payment options & stock levels."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Render Success Screen
  if (createdOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8 max-w-2xl mx-auto text-center space-y-8 pb-24">
        <div className="w-20 h-20 bg-jungle-100 rounded-full flex items-center justify-center mb-2 text-jungle-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Procurement Confirmed!</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto leading-relaxed">
            Your materials have been split and secured under individual supplier escrows. Payment holds will release upon delivery.
          </p>
        </div>

        {/* Display created split orders */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 text-left shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
            Generated Split Orders ({createdOrders.length})
          </h3>
          <div className="divide-y divide-slate-200">
            {createdOrders.map((ord: any) => (
              <div key={ord.reference} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800">
                      {ord.company_name || "Material Supplier"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono font-medium">REF: {ord.reference.substring(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-semibold">
                    KES {Number(ord.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/contractor/dashboard"
          className="px-8 py-3.5 bg-jungle-700 hover:bg-jungle-800 text-white text-xs font-semibold rounded-xl shadow-lg shadow-jungle-700/20 uppercase tracking-wider transition-all"
        >
          Go to Procurement Ledger
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 mx-auto max-w-7xl pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full border border-slate-100 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finalize Procurement</h1>
          <p className="text-slate-500 text-sm mt-1">Configure logistics details and confirm payment allocation.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-3xl flex gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Projections or Summary */}
        <div className="space-y-8">

          {/* Order items detail view */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-700" />
              Materials List ({items.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {items.map((item: CartItem) => {
                const isFlexible = item.deposit_amount !== undefined
                return (
                  <div key={`${item.reference}-${item.paymentOptionReference}`} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-950">{item.product_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.paymentOptionName}</span>
                          <span className="text-[10px] text-slate-300">|</span>
                          <span className="text-[10px] text-slate-500">{item.quantity} {item.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-slate-950">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                      {isFlexible && (
                        <p className="text-[10px] text-jungle-700 font-semibold">
                          Deposit: KES {item.deposit_amount?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-700" />
              Delivery Allocation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Assign to Project Site</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="">Select Target Site...</option>
                  {sites?.map((site: any) => (
                    <option key={site.reference} value={site.name}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Physical Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street name, plot number, region..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Split Payment Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 space-y-8">
          <h2 className="text-lg font-semibold text-slate-950">Purchase Authorization</h2>

          <div className="space-y-4">
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Gross Material Subtotal</span>
              <span className="font-semibold text-slate-900 font-mono">KES {totalPrice().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Logistics Fee</span>
              <span className="font-semibold text-slate-900 font-mono">KES 0</span>
            </div>
            <div className="h-px bg-slate-100 my-4" />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Aggregate Total</span>
                <p className="text-[10px] text-slate-500">Escrow released on delivery</p>
              </div>
              <span className="text-2xl font-bold text-jungle-700 font-mono">KES {totalPrice().toLocaleString()}</span>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-3xl space-y-4">
            <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-widest">Payment Provider Routing</p>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 bg-white border-2 border-jungle-600 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-jungle-50 text-jungle-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Paystack Checkout Gateway</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Supports KES, USD, and Mobile Money deposits</p>
                  </div>
                </div>
                <div className="w-3.5 h-3.5 rounded-full border-4 border-jungle-600 bg-white" />
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing Split Escrows...
              </span>
            ) : (
              <>
                Authorize & Place Order
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-jungle-500 shrink-0" />
            Contractually Binding Agreement
          </div>
        </div>
      </div>
    </div>
  )
}
