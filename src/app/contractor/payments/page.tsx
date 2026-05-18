"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useState, useEffect } from "react"
import {
  CreditCard,
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
  Receipt,
  Landmark
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Payment {
  reference: string
  user: string
  amount: string | number
  paystack_reference: string | null
  payment_method: string | null
  status: string
  order_references: string[]
  created_at: string
}

export default function ContractorPaymentsPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Fetch Contractor Payments History
  const { data: paymentsData, isLoading, error } = useQuery<Payment[]>({
    queryKey: ["contractor-payments"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payments/")
      return response.data.results || response.data
    }
  })

  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    )
  }

  const payments = paymentsData || []

  // Metrics calculations
  const totalAmountPaid = payments
    .filter((p) => p.status.toUpperCase() === "SUCCESS")
    .reduce((acc, p) => acc + Number(p.amount), 0)

  const pendingHolds = payments
    .filter((p) => p.status.toUpperCase() === "PENDING")
    .reduce((acc, p) => acc + Number(p.amount), 0)

  const totalTransactionsCount = payments.length

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.paystack_reference &&
        p.paystack_reference.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus =
      statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-250/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SUCCESSFUL
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-250/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            PENDING
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-50 border border-red-250/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            FAILED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 pb-24 max-w-7xl mx-auto animate-in fade-in duration-300 relative">
      
      {/* Backdrop Pattern */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-jungle-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-48 -right-24 w-80 h-80 bg-suppblue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/contractor/dashboard")}
            className="p-2.5 hover:bg-white rounded-2xl border border-slate-250/60 text-slate-500 hover:text-slate-900 transition-all bg-white/60 backdrop-blur"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-8 h-8 text-suppblue-650 shrink-0" />
              Payments & Escrows
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Escrowed downpayment ledgers secured via Paystack Kenya.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Card 1: Aggregate Payments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Down Payments</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                KES {totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Successfully cleared & verified
          </div>
        </div>

        {/* Card 2: Pending Authorization Holds */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escrow Pending Holds</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                KES {pendingHolds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Awaiting contractor checkout completion
          </div>
        </div>

        {/* Card 3: Total Logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-suppblue-50 text-suppblue-750 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Transaction Logs</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {totalTransactionsCount}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Full audit trail preserved
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
              placeholder="Search reference code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mr-1">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["ALL", "SUCCESS", "PENDING", "FAILED"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    statusFilter === opt ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-jungle-700 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Retrieving bank details...</p>
          </div>
        )}

        {error && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Failed to Load Logs</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We experienced a networking error while resolving your transactional records. Please contact support.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPayments.length === 0 && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No transaction logs</h3>
              <p className="text-slate-500 text-xs mt-1">
                No payment references match the selected search query or filters.
              </p>
            </div>
          </div>
        )}

        {/* Table layout */}
        {!isLoading && !error && filteredPayments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="py-4 px-6">Payment Ref</th>
                  <th className="py-4 px-6">Paystack ID</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Escrow Amount</th>
                  <th className="py-4 px-6">Verification Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.map((payment) => (
                  <tr key={payment.reference} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-mono font-bold text-slate-800">
                      {payment.reference.toUpperCase()}
                    </td>
                    <td className="py-4.5 px-6 font-mono text-slate-500">
                      {payment.paystack_reference || "—"}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="capitalize font-semibold text-slate-650 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {payment.payment_method || "Paystack Gateway"}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-mono font-bold text-slate-900">
                      KES {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4.5 px-6">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-4.5 px-6 text-slate-500 font-medium">
                      {new Date(payment.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4.5 px-6">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-xs font-semibold text-suppblue-700 hover:text-suppblue-850 flex items-center gap-1.5"
                      >
                        Inspect
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Panel Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300 space-y-8 relative">
            
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-suppblue-650" />
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-450 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escrow Hold Secured</p>
                <h4 className="text-2xl font-bold text-slate-900 font-mono">
                  KES {Number(selectedPayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <div className="flex items-center justify-center">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Detailed specs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gateway Specifications</h4>
                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
                  
                  <div className="p-4 flex justify-between">
                    <span className="text-slate-500">Transaction Reference</span>
                    <span className="font-mono font-bold text-slate-800">{selectedPayment.reference.toUpperCase()}</span>
                  </div>

                  <div className="p-4 flex justify-between">
                    <span className="text-slate-500">Paystack ID</span>
                    <span className="font-mono font-bold text-slate-800">{selectedPayment.paystack_reference || "Pending Completion"}</span>
                  </div>

                  <div className="p-4 flex justify-between">
                    <span className="text-slate-500">Payment Gateway Channel</span>
                    <span className="capitalize font-semibold text-slate-800">{selectedPayment.payment_method || "Awaiting Payment"}</span>
                  </div>

                  <div className="p-4 flex justify-between">
                    <span className="text-slate-500">Authorization Date</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(selectedPayment.created_at).toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>

              {/* Linked Orders */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Linked Supplier Split Orders</h4>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                  {selectedPayment.order_references.length === 0 ? (
                    <p className="text-slate-400 text-xs">No orders linked to this transaction reference.</p>
                  ) : (
                    selectedPayment.order_references.map((orderRef) => (
                      <div
                        key={orderRef}
                        className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-800 font-mono">REF: {orderRef.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <Link
                          href="/contractor/orders"
                          className="text-[10px] font-bold text-jungle-700 hover:text-jungle-950 uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                        >
                          View Order
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Escrow Shield Badge Footer */}
            <div className="p-4 bg-jungle-50/20 border border-jungle-100/30 rounded-2xl text-[11px] text-slate-500 flex gap-3 leading-relaxed">
              <ShieldCheck className="w-6 h-6 text-jungle-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Dynamic Escrow Secured:</strong> Payments are stored under secure multi-party logistics accounts and released atomically to suppliers upon verified materials delivery pin dispatch.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
