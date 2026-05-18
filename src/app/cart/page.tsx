"use client"

import { useCartStore, CartItem } from "@/lib/store"
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  CreditCard,
  Truck,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeItem, totalPrice, clearCart } = useCartStore()
  const router = useRouter()

  // Calculate sum of initial required down payments (escrows)
  const calculateTotalDownPayment = () => {
    return items.reduce((acc: number, item: CartItem) => {
      if (item.deposit_amount !== undefined) {
        return acc + item.deposit_amount
      }
      return acc + (item.price * item.quantity)
    }, 0)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your cart is empty</h1>
        <p className="text-slate-500 mt-2 text-center max-w-sm text-sm">
          You haven't added any industrial materials to your procurement list yet.
        </p>
        <Link
          href="/marketplace"
          className="mt-8 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all uppercase tracking-wider"
        >
          Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 mx-auto max-w-7xl pb-24 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Procurement Cart
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-xl">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review your raw materials and select custom payment allocations before committing.</p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs font-extrabold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item: CartItem) => {
            const isFlexible = item.deposit_amount !== undefined

            return (
              <div
                key={`${item.reference}-${item.paymentOptionReference}`}
                className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-6 group hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  isFlexible ? "bg-jungle-500" : "bg-suppblue-500"
                )} />

                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{item.product_name}</h3>
                      <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">REF: {item.reference.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.reference, item.paymentOptionReference)}
                      className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Configuration Ledger details */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <CreditCard className="w-3.5 h-3.5 text-suppblue-600" />
                      <span className="text-slate-500">Plan:</span>
                      <strong className="text-slate-800">{item.paymentOptionName}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <Truck className="w-3.5 h-3.5 text-jungle-600" />
                      <span className="text-slate-500">Fulfillment:</span>
                      <strong className="text-slate-800">Escrow Dispatch</strong>
                    </div>
                  </div>

                  {/* Flexible Amortization Custom Details */}
                  {isFlexible && (
                    <div className="p-4 bg-jungle-50/30 border border-jungle-100/50 rounded-2xl grid grid-cols-3 gap-2 text-left">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Required Down Payment</p>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                          KES {item.deposit_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Plan Duration</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {item.duration_months} Months
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Monthly Cost</p>
                        <p className="text-xs font-mono font-bold text-jungle-750 mt-0.5">
                          KES {item.monthly_amount ? Math.ceil(item.monthly_amount).toLocaleString() : 0} / mo
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="font-extrabold text-slate-950 text-base">
                      KES {item.price.toLocaleString()} <span className="text-slate-400 font-normal text-xs">/ {item.unit}</span>
                    </p>
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      Quantity: <strong className="text-slate-900">{item.quantity} {item.unit}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-bold text-jungle-750 hover:gap-3 transition-all uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Sourcing Materials
          </Link>
        </div>

        {/* Summary Card */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-950/20">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-jungle-500" />
              Procurement Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Gross Order Subtotal</span>
                <span className="text-white font-mono font-semibold">KES {totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Immediate Down Payment Due</span>
                <span className="text-jungle-400 font-mono font-semibold">KES {calculateTotalDownPayment().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Future Financed Ledger</span>
                <span className="text-slate-300 font-mono font-semibold">
                  KES {(totalPrice() - calculateTotalDownPayment()).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Total Book Value</span>
                <span className="text-2xl font-bold text-white font-mono">KES {totalPrice().toLocaleString()}</span>
              </div>
            </div>

            {/* Split Checkout Notice */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 space-y-2 text-xs text-slate-350">
              <p className="font-extrabold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-jungle-500" />
                Automatic Multi-Supplier Split
              </p>
              <p className="text-[10px] leading-relaxed">
                During checkout, your items will be automatically split into individual orders per supplier. Central Paystack transactions will reconcile deposits instantly.
              </p>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-4 bg-jungle-500 hover:bg-jungle-400 text-slate-950 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider shadow-lg shadow-jungle-500/10"
            >
              Secure Procurement Checkout
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="mt-6 flex items-center gap-2 text-[9px] text-slate-500 uppercase tracking-widest justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-jungle-500" />
              Encrypted Corporate Session
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
