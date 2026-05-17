"use client"

import { useCartStore } from "@/lib/store"
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  CreditCard,
  Truck,
  ChevronRight,
  Plus,
  Minus
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeItem, totalPrice, clearCart } = useCartStore()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2 text-center max-w-sm">
          You haven't added any industrial materials to your procurement list yet.
        </p>
        <Link
          href="/marketplace"
          className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8  mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          Procurement Cart
          <span className="text-sm font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
            {items.length} Items
          </span>
        </h1>
        <button
          onClick={() => clearCart()}
          className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.reference}-${item.paymentOptionReference}`} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 group hover:border-slate-300 transition-all">
              <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-slate-200" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">{item.product_name}</h3>
                  <button
                    onClick={() => removeItem(item.reference, item.paymentOptionReference)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
                    <CreditCard className="w-3 h-3 text-suppblue-600" />
                    Plan: <span className="text-slate-900 font-bold">{item.paymentOptionName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
                    <Truck className="w-3 h-3 text-jungle-600" />
                    Delivery: <span className="text-slate-900 font-bold">Standard</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="font-bold text-slate-900">
                    KES {item.price.toLocaleString()} <span className="text-slate-400 font-normal text-xs">/ {item.unit}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{item.quantity} {item.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-sm font-bold text-jungle-700 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Sourcing
          </Link>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/20 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Procurement Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-medium">KES {totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Logistics Fee</span>
                <span className="text-white font-medium">Calculated at Checkout</span>
              </div>
              <div className="h-[1px] bg-white/10 my-4" />
              <div className="flex justify-between">
                <span className="font-bold">Total Amount</span>
                <span className="text-2xl font-black text-white">KES {totalPrice().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-4 bg-jungle-500 hover:bg-jungle-400 text-slate-900 rounded-xl font-black flex items-center justify-center gap-2 transition-all"
            >
              Secure Checkout
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest justify-center">
              <ShieldCheck className="w-3 h-3 text-jungle-500" />
              Encrypted Procurement Session
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
  )
}
