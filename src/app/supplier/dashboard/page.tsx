import { 
  TrendingUp, 
  Package, 
  Truck, 
  DollarSign, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

export default function SupplierDashboard() {
  const stats = [
    { label: "Total Revenue", value: "KES 1.2M", icon: DollarSign, trend: "+12%", up: true, color: "bg-blue-500" },
    { label: "Active Products", value: "142", icon: Package, trend: "+5", up: true, color: "bg-indigo-500" },
    { label: "Pending Orders", value: "24", icon: Clock, trend: "-2", up: false, color: "bg-amber-500" },
    { label: "Dispatched", value: "86", icon: Truck, trend: "+18%", up: true, color: "bg-emerald-500" },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Supplier Overview</h1>
        <p className="text-slate-500">Track your inventory and fulfillment performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? "text-emerald-600" : "text-amber-600"}`}>
                {stat.trend}
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Fulfillment Requests</h2>
            <button className="text-xs font-bold text-suppblue-700 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Contractor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors text-sm group">
                    <td className="px-6 py-4 font-medium text-slate-900">#ORD-00{i}</td>
                    <td className="px-6 py-4 text-slate-600">Portland Cement 50kg</td>
                    <td className="px-6 py-4 text-slate-600">Apex Construction</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">KES 45,000</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Inventory Alerts</h2>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Low Stock: TMT Bars 12mm</p>
                  <p className="text-xs text-slate-500 mt-1">Current stock: 12 units. Reorder point: 50 units.</p>
                  <button className="text-[10px] font-bold text-red-600 hover:underline mt-2 uppercase tracking-wider">Update Inventory</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
