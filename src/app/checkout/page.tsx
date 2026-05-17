"use client"

import { useCartStore } from "@/lib/store"
import { InstallmentProjector } from "@/components/payments/InstallmentProjector"
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Package,
  ChevronRight,
  CheckCircle2,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Find if there's a flexible plan to project
  const flexibleItem = items.find(item => item.paymentOptionName.toLowerCase().includes("flexible"))

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      clearCart()
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-8 text-center">
        <div className="w-20 h-20 bg-jungle-100 rounded-full flex items-center justify-center mb-6 text-jungle-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Procurement Successful!</h1>
        <p className="text-slate-500 mt-2 max-w-sm">
          Your orders have been dispatched to the respective suppliers. You can track status in your dashboard.
        </p>
        <Link
          href="/contractor/dashboard"
          className="mt-8 px-8 py-3 bg-jungle-700 text-white rounded-xl font-bold hover:bg-jungle-800 transition-all shadow-lg shadow-jungle-700/20"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8  mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full border border-slate-100 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900">Finalize Procurement</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: Projection and Items */}
        <div className="space-y-10">
          {flexibleItem ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-jungle-700">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-lg font-bold">Flexible Payment Projection</h2>
              </div>
              <InstallmentProjector
                totalAmount={flexibleItem.price * flexibleItem.quantity}
                minDepositPercentage={20}
                annualInterestRate={15}
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Order Items</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={`${item.reference}-${item.paymentOptionReference}`} className="flex items-center justify-between py-3 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.paymentOptionName}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign to Site</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none">
                  <option>Main Project Site - Nairobi</option>
                  <option>Secondary Site - Kiambu</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preferred Schedule</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Next 48 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-slate-900">KES {totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total VAT (16%)</span>
                <span className="font-bold text-slate-900">KES {(totalPrice() * 0.16).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Logistics & Handling</span>
                <span className="font-bold text-slate-900">KES 2,500</span>
              </div>
              <div className="h-[1px] bg-slate-100 my-4" />
              <div className="flex justify-between">
                <span className="text-lg font-bold text-slate-900">Payable Amount</span>
                <span className="text-3xl font-black text-jungle-700">KES {(totalPrice() * 1.16 + 2500).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Primary Payment Method</p>
              <div className="space-y-2">
                {["M-PESA Paybill", "Bank Guarantee", "Credit Line"].map((m, i) => (
                  <label key={m} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-jungle-600 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-jungle-50 text-slate-400 group-hover:text-jungle-600 transition-colors">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{m}</span>
                    </div>
                    <input type="radio" name="method" defaultChecked={i === 0} className="w-4 h-4 accent-jungle-600" />
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Place Order & Authorize <ChevronRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-jungle-500" />
              Contractually Binding Agreement
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
