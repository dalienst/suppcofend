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
  Landmark,
  Clipboard,
  Check
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Payment {
  reference: string
  user: string // email of paying user
  amount: string | number
  paystack_reference: string | null
  payment_method: string | null
  status: string
  order_references: string[]
  created_at: string
}

export default function SupplierPaymentsPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Fetch Supplier Payments ledger
  const { data: paymentsData, isLoading, error } = useQuery<Payment[]>({
    queryKey: ["supplier-payments"],
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

  // Stats Calculations
  const successfulPayments = payments.filter((p) => p.status.toUpperCase() === "SUCCESS")
  const pendingPayments = payments.filter((p) => p.status.toUpperCase() === "PENDING")
  const totalClearedAmount = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalEscrowPendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Unique clients count
  const uniqueClients = new Set(payments.map((p) => p.user)).size

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.paystack_reference && p.paystack_reference.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus =
      statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250/20">
            CLEARED
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-250/20">
            ESCROW HOLD
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
            FAILED
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
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
              <Receipt className="w-8 h-8 text-jungle-600 shrink-0" />
              Supplier Payments Ledger
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Audit cleared downpayments, financed installment disbursements, and inspect customer transaction references.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        
        {/* Card 1: Revenue Cleared */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cleared Revenue</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                KES {totalClearedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Funds deposited & verified
          </div>
        </div>

        {/* Card 2: Escrow Holds */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Escrow Holds</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                KES {totalEscrowPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Locked in checkout pipelines
          </div>
        </div>

        {/* Card 3: Cleared Escrows count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-suppblue-50 text-suppblue-750 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleared Escrows Count</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {successfulPayments.length}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Fulfillment disbursements audited
          </div>
        </div>

        {/* Card 4: Audited Accounts count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-250/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audited Clients</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1 font-mono">
                {uniqueClients}
              </h2>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Distinct contractor accounts
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
              placeholder="Search reference or contractor email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider mr-1 shrink-0">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["ALL", "SUCCESS", "PENDING", "FAILED"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === opt ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {opt === "SUCCESS" ? "CLEARED" : opt === "PENDING" ? "ESCROW HOLD" : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-jungle-700 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Loading supplier payments ledger...</p>
          </div>
        )}

        {error && (
          <div className="py-24 text-center max-w-sm mx-auto space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Failed to Load Payments</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We experienced a networking error while fetching supplier corporate finances. Please reload the page.
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
              <h3 className="font-bold text-slate-900 text-sm">No transactions found</h3>
              <p className="text-slate-500 text-xs mt-1">
                No payment logs match your search queries or selected status filters.
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
                  <th className="py-4 px-6">Transaction Ref</th>
                  <th className="py-4 px-6">Contractor Client</th>
                  <th className="py-4 px-6">Gateway Ref (Paystack)</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Audited Status</th>
                  <th className="py-4 px-6">Processed Date</th>
                  <th className="py-4 px-6">Linked Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
                {filteredPayments.map((payment) => {
                  const amount = Number(payment.amount)
                  const isSuccess = payment.status.toUpperCase() === "SUCCESS"
                  const channel = payment.payment_method || "card"
                  return (
                    <tr key={payment.reference} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{payment.reference.substring(0, 8).toUpperCase()}</span>
                          <button
                            onClick={() => copyToClipboard(payment.reference, payment.reference)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 active:scale-90"
                          >
                            {copiedText === payment.reference ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clipboard className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          {payment.user || "Contractor email"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-slate-500">
                        {payment.paystack_reference || "—"}
                      </td>
                      <td className="py-4.5 px-6 uppercase tracking-wider text-[10px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          {channel.toLowerCase() === "mpesa" ? <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <CreditCard className="w-3.5 h-3.5 text-suppblue-750 shrink-0" />}
                          {channel}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-mono font-bold text-sm">
                        <span className={isSuccess ? "text-emerald-650" : "text-slate-900"}>
                          KES {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
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
                          className="text-xs font-semibold text-jungle-750 hover:text-jungle-850 flex items-center gap-1.5"
                        >
                          Audit References
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

      {/* Audit References Drawer */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300 space-y-8 relative">
            
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-jungle-700" />
                    Reconciliation Audit Trail
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono font-semibold">REF: {selectedPayment.reference.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-455 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment details summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cleared Deposit Parameters</h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-455">Total Cleared amount:</span>
                    <span className="font-mono font-extrabold text-emerald-650 text-sm">
                      KES {Number(selectedPayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-455">Customer Account:</span>
                    <span className="font-semibold text-slate-900">{selectedPayment.user}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-455">Paystack Gateway ID:</span>
                    <span className="font-mono text-slate-900">{selectedPayment.paystack_reference || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-455">Deposit method:</span>
                    <span className="font-semibold text-slate-800 uppercase tracking-widest text-[10px]">{selectedPayment.payment_method || "card"}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-455">Audit verified at:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedPayment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Orders */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Linked Procurement Orders ({selectedPayment.order_references.length})</h4>
                
                <div className="space-y-2">
                  {selectedPayment.order_references.map((orderRef) => (
                    <div
                      key={orderRef}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between font-semibold"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-900 font-mono">
                          REF: {orderRef.toUpperCase()}
                        </span>
                        <p className="text-[9px] text-slate-400">Escrow Contract ID</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedPayment(null)
                          // Route supplier to manage order
                          router.push(`/supplier/orders?search=${orderRef}`)
                        }}
                        className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-655 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        Inspect Order
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4.5 bg-jungle-50 border border-jungle-200/40 rounded-3xl text-center space-y-1">
              <span className="text-[10px] font-bold text-jungle-850 uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-jungle-650" />
                Escrow Settlement Complete
              </span>
              <p className="text-[9px] text-slate-500 font-medium">
                This transaction has been successfully verified, matched, and locked under contract-backed legal terms.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
