"use client"

import { useState } from "react"
import { useLayers } from "@/hooks/useInventory"
import {
  Search,
  ShoppingBag,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Tag,
  LogIn,
  Building2,
  Plus
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/lib/store"
import toast from "react-hot-toast"

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  const { data: layers } = useLayers()
  const addItem = useCartStore((state: any) => state.addItem)

  // Fetch Marketplace Products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedLayer, search],
    queryFn: async () => {
      let url = "/api/v1/products/"
      const params = new URLSearchParams()
      params.append("marketplace", "true")
      if (selectedLayer) params.append("layer__reference", selectedLayer)
      if (search) params.append("search", search)

      const response = await api.get(`${url}?${params.toString()}`)
      return response.data.results || response.data
    }
  })

  const isAuth = !!session
  const isContractor = (session?.user as any)?.is_contractor

  // 1. Dynamic Supplier Aggregation from loaded products
  const uniqueSuppliers = Array.from(
    new Map(
      products
        ?.filter((p: any) => p.company_name && p.company_reference)
        ?.map((p: any) => [p.company_reference, p.company_name])
    ).entries()
  ).map(([ref, name]) => ({ reference: ref, name: name as string }))

  // 2. Filter products dynamically (including the client-side supplier filter)
  const filteredProducts = products?.filter((product: any) => {
    if (selectedSupplier && product.company_reference !== selectedSupplier) {
      return false
    }
    return true
  }) || []



  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 animate-in fade-in duration-300">

      {/* Sidebar Filters */}
      <aside className="w-72 bg-white border-r border-slate-200 overflow-auto p-6 space-y-8 hidden lg:block shrink-0">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Material Layers</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedLayer(null)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                !selectedLayer
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span>All Products</span>
              <span className="text-[10px] opacity-60">({products?.length || 0})</span>
            </button>
            {layers?.map((layer: any) => (
              <button
                key={layer.reference}
                onClick={() => {
                  setSelectedLayer(layer.reference)
                  setSelectedSupplier(null) // reset supplier on layer change to avoid zero results
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  selectedLayer === layer.reference
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>

        {/* Suppliers Section */}
        {uniqueSuppliers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Verified Suppliers</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSupplier(null)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                  !selectedSupplier
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <span>All Suppliers</span>
              </button>
              {uniqueSuppliers.map((supplier) => (
                <button
                  key={supplier.reference}
                  onClick={() => setSelectedSupplier(supplier.reference)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                    selectedSupplier === supplier.reference
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>{supplier.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Financing Options</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Escrow Safe</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Procurements are restricted to a single supplier per order to align delivery zones, payments, and PIN handovers.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 sm:p-8 space-y-8">
        <div className="mx-auto space-y-8 max-w-7xl">

          {/* Top Banner & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Industrial B2B Marketplace</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Source construction materials directly from verified suppliers.</p>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, or SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none shadow-sm focus:ring-2 focus:ring-slate-950/10 focus:border-slate-950 transition-all"
              />
            </div>
          </div>

          {/* Anonymous User Promotion Banner */}
          {!isAuth && (
            <div className="p-5 bg-gradient-to-r from-jungle-700 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="font-extrabold text-lg flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-jungle-300 shrink-0" />
                  Access Negotiated Corporate Financing
                </h2>
                <p className="text-xs text-jungle-100 max-w-xl">
                  Sign in with your Contractor Account to utilize down-payments, amortized flexible schedules, and unified multi-supplier checkout.
                </p>
              </div>
              <Link
                href="/login"
                className="bg-white text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-jungle-50 transition-colors shadow-lg self-start md:self-auto uppercase tracking-wider shrink-0"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {/* Responsive Mobile Filters (Only visible on medium and small screens) */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Material Layers</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedLayer(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                    !selectedLayer ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  All Layers ({products?.length || 0})
                </button>
                {layers?.map((layer: any) => (
                  <button
                    key={layer.reference}
                    onClick={() => {
                      setSelectedLayer(layer.reference)
                      setSelectedSupplier(null)
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                      selectedLayer === layer.reference ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>
            
            {uniqueSuppliers.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Verified Suppliers</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                      !selectedSupplier ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    All Suppliers
                  </button>
                  {uniqueSuppliers.map((supplier) => (
                    <button
                      key={supplier.reference}
                      onClick={() => setSelectedSupplier(supplier.reference)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                        selectedSupplier === supplier.reference ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      {supplier.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => {
                const hasPaymentOptions = true

                return (
                  <div key={product.reference} className="bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative">
                    
                    {/* Visual Card Image Section */}
                    <div className="aspect-video bg-slate-100 relative shrink-0 flex items-center justify-center border-b border-slate-100">
                      <ShoppingBag className="w-12 h-12 text-slate-200" />
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 rounded bg-slate-950 text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                          {product.layer}
                        </span>
                      </div>
                    </div>

                    {/* Card Description Body */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-slate-900 group-hover:text-jungle-750 transition-colors text-base line-clamp-1">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs truncate">{product.branch_name || "Global Delivery"}</span>
                        </div>
                        {product.company_name && (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span>Supplier: {product.company_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-widest">Price per {product.unit || "unit"}</p>
                          <p className="text-lg font-bold text-slate-950">KES {Number(product.price).toLocaleString()}</p>
                        </div>
                        
                         <div className="flex items-center gap-2">
                          {/* Inspect Details Button */}
                          <Link
                            href={`/marketplace/${product.reference}`}
                            className="px-5 py-2.5 bg-slate-950 hover:bg-jungle-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-slate-950/10 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>Inspect & Buy</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
              <p className="text-slate-500 mt-2">There are no products matching your selected supplier or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
