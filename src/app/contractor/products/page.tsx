"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Plus, Package, Search, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ContractorProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)

  // Fetch Contractor Products with backend pagination & search
  const { data, isLoading } = useQuery({
    queryKey: ["contractor-products", searchQuery, page],
    queryFn: async () => {
      const response = await api.get("/api/v1/products/", {
        params: {
          search: searchQuery || undefined,
          page: page
        }
      })
      return response.data
    }
  })

  // Extract pagination details from backend response
  const products = data?.results || data || []
  const totalCount = data?.count || products.length
  const hasNext = !!data?.next
  const hasPrevious = !!data?.previous
  const itemsPerPage = 100 // Backend default PAGE_SIZE
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products Management</h1>
          <p className="text-slate-500">Manage and track your products listed on the marketplace.</p>
        </div>
        <Link
          href="/contractor/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-jungle-700 hover:bg-jungle-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-jungle-700/20"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header / Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              Backend Filter: active
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-slate-100 rounded" />
                          <div className="h-3 w-24 bg-slate-50 rounded" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products?.map((product: any) => (
                <tr key={product.reference} className="hover:bg-slate-50 transition-colors group text-sm">
                  <td className="px-6 py-4">
                    <Link
                      href={`/contractor/products/${product.reference}`}
                      className="flex items-center gap-3 group-hover:text-jungle-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-jungle-50 group-hover:text-jungle-600 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-jungle-600 transition-colors">{product.product_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">REF: {product.reference}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{product.quantity}</p>
                    <p className="text-[10px] text-slate-500">{product.unit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-900">{Number(product.price).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/contractor/products/${product.reference}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-jungle-700 bg-jungle-50 hover:bg-jungle-100 rounded-xl transition-all"
                    >
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && products?.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-slate-200" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">No products match search criteria</h3>
              <p className="text-slate-500">List new products or try another keyword in the search bar.</p>
            </div>
            <button
              onClick={() => { setSearchQuery(""); setPage(1); }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Backend Pagination Footer Controls */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 font-semibold shrink-0">
            <div>
              Showing {products.length} of {totalCount} total catalog entries
            </div>
            {(hasPrevious || hasNext) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasNext}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
