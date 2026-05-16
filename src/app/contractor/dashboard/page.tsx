import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Calendar,
  ChevronRight,
  MapPin,
  Clock
} from "lucide-react"

export default function ContractorDashboard() {
  const activeOrders = [
    { id: "ORD-8821", item: "Cement (500 Bags)", supplier: "Bamburi Special", status: "In Transit", date: "May 18", color: "text-blue-600 bg-blue-50" },
    { id: "ORD-8822", item: "Steel Bars (2 Tons)", supplier: "Apex Steel", status: "Processing", date: "May 19", color: "text-amber-600 bg-amber-50" },
  ]

  const upcomingPayments = [
    { id: "PMT-012", item: "Tiling Materials", amount: "KES 142,000", date: "May 22", plan: "50/50" },
    { id: "PMT-013", item: "Roofing Sheets", amount: "KES 85,000", date: "June 05", plan: "Flexible" },
  ]

  return (
    <div className="p-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Procurement Dashboard</h1>
          <p className="text-slate-500 text-sm">Managing 4 active project sites in Nairobi.</p>
        </div>
        <button className="px-6 py-3 bg-jungle-700 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-jungle-800 transition-all shadow-lg shadow-jungle-700/20">
          <ShoppingBag className="w-4 h-4" />
          New Procurement
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-jungle-100 text-jungle-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Orders</p>
          </div>
          <p className="text-3xl font-black text-slate-900">12</p>
          <div className="mt-4 text-xs font-medium text-jungle-600 flex items-center gap-1">
            4 arriving today <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Outstanding</p>
          </div>
          <p className="text-3xl font-black text-slate-900">KES 840K</p>
          <div className="mt-4 text-xs font-medium text-amber-600 flex items-center gap-1">
            2 payments due this week <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-suppblue-100 text-suppblue-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Sites</p>
          </div>
          <p className="text-3xl font-black text-slate-900">4</p>
          <div className="mt-4 text-xs font-medium text-suppblue-600 flex items-center gap-1">
            View logistics map <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Track Shipments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Track Shipments</h2>
            <button className="text-xs font-bold text-jungle-700 hover:underline">View History</button>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-jungle-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${order.color}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{order.item}</p>
                    <p className="text-xs text-slate-500">{order.supplier} &bull; {order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${order.color}`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Est. {order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Calendar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Payment Calendar</h2>
            <button className="text-xs font-bold text-jungle-700 hover:underline">Schedule</button>
          </div>
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <div className="space-y-4 relative z-10">
              {upcomingPayments.map((pmt) => (
                <div key={pmt.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/10 group hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-jungle-400 text-slate-900 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                      {pmt.plan[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{pmt.amount}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{pmt.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-jungle-400">
                      <Clock className="w-3 h-3" />
                      {pmt.date}
                    </div>
                    <button className="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest mt-1 transition-colors">Pay Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
