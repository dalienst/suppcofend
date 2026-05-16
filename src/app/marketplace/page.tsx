"use client"

import { useState } from "react"
import { useLayers } from "@/hooks/useInventory"
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  MapPin, 
  ChevronRight,
  ArrowRight,
  Tag
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  
  const { data: layers } = useLayers()
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedLayer, search],
    queryFn: async () => {
      let url = "/api/v1/products/"
      const params = new URLSearchParams()
      if (selectedLayer) params.append("layer__reference", selectedLayer)
      if (search) params.append("search", search)
      
      const response = await api.get(`${url}?${params.toString()}`)
      return response.data.results
    }
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar Filters */}
      <aside className="w-72 bg-white border-r border-slate-200 overflow-auto p-6 space-y-8 hidden lg:block">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedLayer(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                !selectedLayer ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              All Products
            </button>
            {layers?.map((layer: any) => (
              <button
                key={layer.reference}
                onClick={() => setSelectedLayer(layer.reference)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedLayer === layer.reference ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Availability</h3>
          <div className="space-y-3">
            {["In Stock", "On Order", "Site Specific"].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Industrial Marketplace</h1>
              <p className="text-slate-500">Source materials directly from verified suppliers.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search products, brands, or SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products?.map((product: any) => (
                <div key={product.reference} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="aspect-video bg-slate-100 relative">
                    {/* Placeholder for product image */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 rounded bg-white/90 backdrop-blur text-[10px] font-bold text-slate-900 uppercase tracking-wider shadow-sm">
                        {product.layer}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-jungle-700 transition-colors">{product.product_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{product.branch || "Global Delivery"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Price per {product.unit || "unit"}</p>
                        <p className="text-lg font-extrabold text-slate-900">KES {Number(product.price).toLocaleString()}</p>
                      </div>
                      <Link 
                        href={`/marketplace/${product.reference}`}
                        className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-jungle-700 transition-all shadow-lg shadow-slate-900/20"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && products?.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("animate-spin", className)} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}
