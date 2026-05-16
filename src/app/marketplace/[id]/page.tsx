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
  CreditCard
} from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/products/${params.id}/`)
      return response.data
    }
  })

  const handleAddToCart = () => {
    if (!product || !selectedPayment) return
    
    const paymentOption = product.payment_options_details.find((opt: any) => opt.reference === selectedPayment)
    
    addItem({
      reference: product.reference,
      product_name: product.product_name,
      price: Number(product.price),
      quantity: quantity,
      unit: product.unit,
      paymentOptionReference: selectedPayment,
      paymentOptionName: paymentOption?.name || "Standard",
    })
    
    router.push("/cart")
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return <div>Product not found</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
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
          <div className="aspect-square bg-white rounded-3xl border border-slate-200 flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-32 h-32 text-slate-100" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics</p>
                <p className="text-xs font-bold text-slate-900">Direct Delivery</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</p>
                <p className="text-xs font-bold text-slate-900">SGS Inspected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Options Section */}
        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-jungle-50 text-jungle-700 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Tag className="w-3 h-3" />
              In Stock & Ready
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">{product.product_name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.branch || "Multiple Locations"}</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <p className="text-sm text-slate-500 font-medium">SKU: {product.sku}</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-slate-900/20">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Price</p>
              <p className="text-3xl font-black">KES {Number(product.price).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stock</p>
              <p className="text-xl font-bold">{Number(product.quantity)} {product.unit}</p>
            </div>
          </div>

          {/* Payment Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-suppblue-600" />
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
                      <p className="text-sm font-bold text-slate-900">{opt.name}</p>
                      <p className="text-xs text-slate-500">{opt.description || "Standard industry terms apply."}</p>
                    </div>
                  </div>
                  {selectedPayment === opt.reference && <div className="w-2 h-2 rounded-full bg-jungle-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden h-14">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-12 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
              >-</button>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-12 text-center font-bold text-slate-900 outline-none"
              />
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-12 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
              >+</button>
            </div>
            
            <button 
              disabled={!selectedPayment}
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-jungle-700 hover:bg-jungle-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-jungle-700/20 disabled:opacity-50 disabled:bg-slate-400"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Procurement Cart
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-suppblue-600" />
          <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
          {Object.entries(product.specifications || { "Standard": "General Industrial", "Compliance": "KEBS Approved" }).map(([key, val]) => (
            <div key={key} className="bg-white p-6 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{key}</span>
              <span className="text-sm font-bold text-slate-900">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Tag({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4"/><path d="M13 7.5a1 1 0 0 0 1 1h.01a1 1 0 0 0 0-2H14a1 1 0 0 0-1 1Z"/><path d="M7.41 22 2 16.59V2h14.59L22 7.41V22Z"/></svg>
  )
}
