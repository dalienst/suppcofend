"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  Check,
  Info,
  Calendar,
  CreditCard,
  UserCheck,
  AlertCircle
} from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Zustand store
  const addItem = useCartStore((state: any) => state.addItem)

  // Flexible Plan customization states
  const [customDeposit, setCustomDeposit] = useState<number>(0)
  const [customDuration, setCustomDuration] = useState<number>(3)

  // Query product data
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/products/${params.id}/`)
      return response.data
    }
  })

  const isAuth = !!session
  const isContractor = (session?.user as any)?.is_contractor

  // Find active selected payment option
  const activeOption = product?.payment_options_details?.find((opt: any) => opt.reference === selectedPayment)
  const isFlexible = activeOption?.payment_type === "FLEXIBLE"

  // Mathematical Amortization Calculations
  const totalPrice = product ? Number(product.price) * quantity : 0
  const minDepositPercentage = activeOption?.min_deposit_percentage ? Number(activeOption.min_deposit_percentage) : 20.0
  const minDepositAmount = (totalPrice * minDepositPercentage) / 100
  const activeDeposit = customDeposit > 0 ? customDeposit : minDepositAmount
  const remainingPrincipal = Math.max(0, totalPrice - activeDeposit)
  const interestRate = activeOption?.interest_rate ? Number(activeOption.interest_rate) : 0.0
  const totalWithInterest = remainingPrincipal * (1 + (interestRate / 100))
  const monthlyInstallment = customDuration > 0 ? totalWithInterest / customDuration : 0

  const handleAddToCart = () => {
    if (!product || !selectedPayment) return

    // Save customized flexible parameters if active
    const depositToSave = isFlexible ? activeDeposit : undefined
    const durationToSave = isFlexible ? customDuration : undefined
    const monthlyToSave = isFlexible ? monthlyInstallment : undefined

    try {
      addItem({
        reference: product.reference,
        product_name: product.product_name,
        price: Number(product.price),
        quantity: quantity,
        unit: product.unit,
        paymentOptionReference: selectedPayment,
        paymentOptionName: activeOption?.name || "Standard",
        deposit_amount: depositToSave,
        duration_months: durationToSave,
        monthly_amount: monthlyToSave,
        company_reference: product.company_reference,
        company_name: product.company_name,
        payment_type: activeOption?.payment_type
      })

      toast.success("Added to procurement cart!")
      router.push("/cart")
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart.")
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return <div>Product not found</div>

  return (
    <div className="p-8 mx-auto space-y-12 max-w-7xl pb-24">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full border border-slate-100 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/marketplace" className="hover:text-slate-900">Marketplace</Link>
          <span>/</span>
          <span className="text-slate-900">{product.layer}</span>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{product.product_name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Section */}
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200 flex items-center justify-center shadow-sm relative">
            <ShoppingBag className="w-32 h-32 text-slate-100" />
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1.5 rounded-full bg-slate-950 text-white font-bold text-[10px] tracking-widest uppercase">
                {product.layer}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Logistics</p>
                <p className="text-xs font-semibold text-slate-900">Direct Delivery</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verification</p>
                <p className="text-xs font-semibold text-slate-900">SGS Inspected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Options Section */}
        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-jungle-50 text-jungle-750 text-[10px] font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-jungle-600 rounded-full animate-pulse" />
              In Stock & Ready
            </div>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">{product.product_name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.branch_name || "Multiple Locations"}</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <p className="text-sm text-slate-500 font-medium">SKU: {product.sku}</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-slate-900/20">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Unit Price</p>
              <p className="text-3xl font-bold">KES {Number(product.price).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Stock</p>
              <p className="text-xl font-semibold">{Number(product.quantity)} {product.unit}</p>
            </div>
          </div>

          {/* Payment Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-800" />
              Available Payment Plans
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {product.payment_options_details?.map((opt: any) => (
                <button
                  key={opt.reference}
                  onClick={() => setSelectedPayment(opt.reference)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group",
                    selectedPayment === opt.reference
                      ? "border-jungle-600 bg-jungle-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      selectedPayment === opt.reference ? "bg-jungle-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    )}>
                      {opt.payment_type === "FLEXIBLE" ? <Calendar className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{opt.name}</p>
                      <p className="text-xs text-slate-500">{opt.description || "Standard B2B corporate terms."}</p>
                    </div>
                  </div>
                  {selectedPayment === opt.reference && <div className="w-2.5 h-2.5 rounded-full bg-jungle-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flexible Plan Simulator */}
          {selectedPayment && isFlexible && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Flexible Plan Customization</h4>
                <p className="text-xs text-slate-500 mt-1">Configure your corporate installment schedules dynamically:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Down Payment Customization */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Down Payment Amount (KES)</label>
                  <input
                    type="number"
                    value={customDeposit > 0 ? customDeposit : minDepositAmount}
                    min={minDepositAmount}
                    max={totalPrice}
                    onChange={(e) => setCustomDeposit(Math.max(minDepositAmount, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-none focus:ring-2 focus:ring-jungle-500/10 focus:border-jungle-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Min required: <strong>KES {minDepositAmount.toLocaleString()}</strong> ({minDepositPercentage}%)
                  </p>
                </div>

                {/* 2. Duration selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Payment Period (Months)</label>
                  <select
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-jungle-500/10"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Interest rate: <strong>{interestRate}% per annum</strong>
                  </p>
                </div>
              </div>

              {/* Installment Schedule Result Panel */}
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Financed Amount (Principal):</span>
                  <span className="font-mono font-semibold text-slate-800">KES {remainingPrincipal.toLocaleString()}</span>
                </div>
                {interestRate > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Financing Cost (Interest):</span>
                    <span className="font-mono font-semibold text-red-600">+ KES {(totalWithInterest - remainingPrincipal).toLocaleString()}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">Estimated Monthly Installment:</span>
                  <span className="text-sm font-bold text-jungle-700 font-mono">
                    KES {Math.ceil(monthlyInstallment).toLocaleString()} / mo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Unauthenticated / Read-only Banner */}
          {!isAuth ? (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex gap-3.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Corporate Account Required</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Negotitated B2B pricing, credit lines, down-payments, and installment options are locked. Sign in to place orders.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 underline uppercase tracking-wider"
                >
                  Log In &rarr;
                </Link>
              </div>
            </div>
          ) : !isContractor ? (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex gap-3.5">
              <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-950">View-Only Account Mode</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Supplier accounts are restricted to catalog audits on the marketplace. Use a Contractor account to place orders.
                </p>
              </div>
            </div>
          ) : (
            /* Quantity and Actions */
            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden h-14 shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500 font-semibold transition-colors"
                >-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-12 text-center font-semibold text-slate-900 outline-none"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500 font-semibold transition-colors"
                >+</button>
              </div>

              <button
                disabled={!selectedPayment}
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-jungle-700 hover:bg-jungle-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-jungle-700/20 disabled:opacity-50 disabled:bg-slate-450"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Procurement Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Technical Specifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
          {Object.entries(product.specifications || { "Standard": "General Industrial", "Compliance": "KEBS Approved" }).map(([key, val]) => (
            <div key={key} className="bg-white p-6 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{key}</span>
              <span className="text-sm font-semibold text-slate-900">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
