"use client"

import { SignupForm } from "@/components/auth/SignupForm"
import { ShoppingBag, Zap } from "lucide-react"

export default function SupplierSignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Info */}
        <div className="md:w-1/3 bg-suppblue-700 p-10 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Supplier Account</h1>
              <p className="text-suppblue-100 text-sm mt-2 leading-relaxed">
                Start selling your industrial equipment and materials to a vast network of verified contractors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-50">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-semibold tracking-widest uppercase">Suppco Core</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-10">
          <SignupForm role="supplier" />
        </div>
      </div>
    </div>
  )
}
