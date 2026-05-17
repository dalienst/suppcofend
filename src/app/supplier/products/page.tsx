"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Plus, Package, Search, Filter, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SupplierProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const response = await api.get("/api/v1/products/")
      return response.data.results
    }
  })

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-500">Manage and track your products listed on the marketplace.</p>
        </div>
        <Link
          href="/supplier/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-suppblue-700 hover:bg-suppblue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-suppblue-700/20"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-suppblue-500/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
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
                      href={`/supplier/products/${product.reference}`} 
                      className="flex items-center gap-3 group-hover:text-suppblue-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-suppblue-50 group-hover:text-suppblue-600 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-suppblue-600 transition-colors">{product.product_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">REF: {product.reference}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{product.quantity}</p>
                    <p className="text-[10px] text-slate-500">{product.unit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-900">{Number(product.price).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/supplier/products/${product.reference}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-suppblue-700 bg-suppblue-50 hover:bg-suppblue-100 rounded-xl transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Manage
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
              <h3 className="text-lg font-bold text-slate-900">No products yet</h3>
              <p className="text-slate-500">List your first product to start selling on SUPPCO.</p>
            </div>
            <Link
              href="/supplier/products/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
