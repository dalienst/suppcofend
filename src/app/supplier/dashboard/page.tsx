"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { 
  Building2, 
  Package, 
  Truck, 
  DollarSign, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  Loader2,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

// Interfaces
interface Product {
  id: number
  product_name?: string
  name?: string
  sku: string
  reference: string
  quantity: string | number
  unit: string | null
  price: string | number
}

interface OrderItem {
  id: number
  product: {
    product_name?: string
    name?: string
    sku: string
  }
  quantity: number
  price_at_purchase: string
}

interface Order {
  reference: string
  user: string
  status: "DRAFT" | "PLACED" | "PARTIALLY_DISPATCHED" | "DISPATCHED" | "COMPLETED" | "CANCELLED"
  total_amount: string | number
  items: OrderItem[]
  created_at: string
}

interface Branch {
  id: number
  reference: string
  name: string
}

export default function SupplierDashboard() {
  
  // 1. Fetch Real-time Products Data
  const { data: productsData, isLoading: isLoadingProducts } = useQuery<any>({
    queryKey: ["supplier-products-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/v1/products/")
      return response.data.results || response.data
    }
  })

  // 2. Fetch Real-time Supplier Orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery<any>({
    queryKey: ["supplier-orders-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/v1/supplierorders/")
      return response.data.results || response.data
    }
  })

  // 3. Fetch Real-time Branches Data
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery<any>({
    queryKey: ["supplier-branches-dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/v1/branches/")
      return response.data.results || response.data
    }
  })

  const isLoading = isLoadingProducts || isLoadingOrders || isLoadingBranches

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-suppblue-600 mx-auto" />
          <p className="text-slate-500 text-xs font-bold">Compiling supplier overview metrics...</p>
        </div>
      </div>
    )
  }

  const productsList: Product[] = Array.isArray(productsData) ? productsData : []
  const ordersList: Order[] = Array.isArray(ordersData) ? ordersData : []
  const branchesList: Branch[] = Array.isArray(branchesData) ? branchesData : []

  // Metric Computations
  const totalProducts = productsList.length
  const totalBranches = branchesList.length
  const totalOrders = ordersList.length
  
  // Total Revenue (Sum total amount of COMPLETED or PLACED orders)
  const totalRevenue = ordersList
    .filter(order => order.status !== "CANCELLED" && order.status !== "DRAFT")
    .reduce((acc, order) => acc + Number(order.total_amount || 0), 0)

  // Pending Orders Count
  const pendingOrders = ordersList.filter(order => order.status === "PLACED").length

  // Low Stock Items (Quantity <= 15)
  const lowStockItems = productsList.filter(prod => Number(prod.quantity || 0) <= 15)

  // Stat Widgets Mapping
  const stats = [
    { 
      label: "Total Revenue", 
      value: `KES ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-suppblue-600 text-white shadow-suppblue-500/20",
      description: "From active orders"
    },
    { 
      label: "Active Products", 
      value: String(totalProducts), 
      icon: Package, 
      color: "bg-indigo-600 text-white shadow-indigo-500/20",
      description: "Listed in catalogue"
    },
    { 
      label: "Fulfillment Requests", 
      value: String(totalOrders), 
      icon: Clock, 
      color: "bg-amber-500 text-white shadow-amber-500/20",
      description: `${pendingOrders} awaiting dispatch`
    },
    { 
      label: "Operational Branches", 
      value: String(totalBranches), 
      icon: Building2, 
      color: "bg-emerald-600 text-white shadow-emerald-500/20",
      description: "Assigned base locations"
    },
  ]

  // Status Badge Helper
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 border-emerald-100 text-emerald-700"
      case "DISPATCHED":
        return "bg-suppblue-50 border-suppblue-100 text-suppblue-700"
      case "PARTIALLY_DISPATCHED":
        return "bg-indigo-50 border-indigo-100 text-indigo-700"
      case "PLACED":
        return "bg-amber-50 border-amber-100 text-amber-700 font-black animate-pulse"
      case "CANCELLED":
        return "bg-red-50 border-red-100 text-red-700"
      default:
        return "bg-slate-50 border-slate-100 text-slate-600"
    }
  }

  return (
    <div className="p-4 mx-auto space-y-8 animate-in fade-in-50 duration-300">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Supplier Overview</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time tracking of operational metrics, branches, and fulfillment pipelines.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/supplier/products/new"
            className="bg-suppblue-600 hover:bg-suppblue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Package className="w-4 h-4" />
            List New Product
          </Link>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
            <div className="space-y-2">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{stat.description}</p>
            </div>
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-md", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Roster & Racks section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Fulfillment Requests */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-lg">Fulfillment Requests</h2>
              <p className="text-slate-500 text-[11px] mt-0.5">Fulfillment tasks submitted by general contractors.</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ordersList.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {ordersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 max-w-sm mx-auto text-center">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">No Fulfillment Requests</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Once contractors place orders for your catalogue items, they will instantly stream into this live queue.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order Code</th>
                    <th className="px-6 py-3.5">Contractor</th>
                    <th className="px-6 py-3.5">Stock Items</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersList.slice(0, 5).map((order) => {
                    const firstItem = order.items?.[0];
                    const itemSummary = firstItem 
                      ? `${firstItem.product?.product_name || firstItem.product?.name || "Product"} (x${firstItem.quantity})`
                      : "No items";
                    const extraCount = (order.items?.length || 0) - 1;

                    return (
                      <tr key={order.reference} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          #{order.reference.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          @{order.user}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="font-bold text-slate-700">{itemSummary}</span>
                          {extraCount > 0 && (
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              + {extraCount} more products
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          KES {Number(order.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            getStatusBadge(order.status)
                          )}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dynamic Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 shrink-0">
            <h2 className="font-black text-slate-900 text-lg">Inventory Alerts</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">Real-time warnings for items nearing storage exhaustion.</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">All Stock Levels Healthy</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    All industrial inventory items are currently well-stocked and above minimum reorder points.
                  </p>
                </div>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.reference} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 overflow-hidden flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.product_name || item.name || "Unnamed Product"}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Current: <span className="font-bold text-red-600">{Number(item.quantity)} units</span> left. (SKU: {item.sku})
                    </p>
                    <Link 
                      href={`/supplier/products/${item.reference}`}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider flex items-center gap-0.5"
                    >
                      Inspect & Restock
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
