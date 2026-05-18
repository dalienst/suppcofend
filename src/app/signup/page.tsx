"use client"

import Link from "next/link"
import { ShoppingBag, Truck, ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignupSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contractor Option */}
        <Link
          href="/signup/contractor"
          className="group relative bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-jungle-200 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-48 h-48 text-jungle-600" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-jungle-50 rounded-2xl flex items-center justify-center text-jungle-600 group-hover:scale-110 transition-transform">
              <Truck className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900">For Contractors</h2>
              <p className="text-slate-500 mt-2 text-lg">
                Access industrial materials, track deliveries, and manage project procurement in one place.
              </p>
            </div>

            <ul className="space-y-3 pt-4">
              {["Real-time Inventory", "Flexible Payments", "Site Delivery Tracking"].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-jungle-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="pt-6 flex items-center gap-2 text-jungle-700 font-semibold">
              Join as Contractor <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Supplier Option */}
        <Link
          href="/signup/supplier"
          className="group relative bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-suppblue-200 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingBag className="w-48 h-48 text-suppblue-600" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-suppblue-50 rounded-2xl flex items-center justify-center text-suppblue-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900">For Suppliers</h2>
              <p className="text-slate-500 mt-2 text-lg">
                List your products, manage fulfillment across branches, and reach more industrial buyers.
              </p>
            </div>

            <ul className="space-y-3 pt-4">
              {["Multi-branch Mgmt", "Direct Sales Channel", "Fulfillment Tracking"].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-suppblue-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="pt-6 flex items-center gap-2 text-suppblue-700 font-semibold">
              Join as Supplier <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Branding */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50">
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">SUPPCO Industrial</span>
      </div>
    </div>
  )
}
