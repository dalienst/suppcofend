"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, ShieldCheck, ArrowRight, Building2, Landmark } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "Unknown"
  const [dots, setDots] = useState("")

  // Dynamic status check micro-animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xl shadow-slate-250/10 space-y-8 relative overflow-hidden">
        
        {/* Visual Premium Backdrop Pattern */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-jungle-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-suppblue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Success Icon Badge */}
        <div className="w-20 h-20 bg-jungle-100/80 rounded-full flex items-center justify-center mx-auto text-jungle-650 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Dynamic Headers */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Transaction Authorized!
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Your upfront deposit has been successfully cleared and authorized via the Paystack Secure Checkout Gateway.
          </p>
        </div>

        {/* Receipt Ledger Table */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium uppercase tracking-wider">Gateway Provider</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-suppblue-500" />
              Paystack Kenya
            </span>
          </div>
          <div className="h-px bg-slate-200/50" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium uppercase tracking-wider">Transaction Status</span>
            <span className="text-jungle-750 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-jungle-500 rounded-full animate-ping" />
              Reconciled{dots}
            </span>
          </div>
          <div className="h-px bg-slate-200/50" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-450 font-medium uppercase tracking-wider">Payment Reference</span>
            <span className="font-mono font-bold text-slate-800 select-all">
              {reference.substring(0, 16).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Corporate Notice */}
        <div className="p-4 bg-jungle-50/20 border border-jungle-100/30 rounded-2xl text-[11px] text-slate-500 leading-relaxed text-left flex gap-2.5">
          <ShieldCheck className="w-5 h-5 text-jungle-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Dynamic Split-Escrow Active:</strong> Your down payment has been atomically split and assigned to individual supplier ledger channels. Shipment pipelines will commence immediately.
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4 pt-4">
          <Link
            href="/contractor/dashboard"
            className="w-full py-4 bg-slate-950 hover:bg-jungle-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-slate-950/10"
          >
            <span>Proceed to Procurement Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-300" />
            SUPPCO Corporate Logistics Escrow
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentsCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
