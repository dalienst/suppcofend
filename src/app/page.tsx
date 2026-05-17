import Link from "next/link"
import { ArrowRight, ShoppingBag, Store, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-white border-b border-border">
        <div className=" mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            Supply Chain Reimagined
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mb-6">
            Industrial Procurement <br />
            <span className="text-slate-500">at the Speed of Thought</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            A premium B2B platform connecting contractors with specialized suppliers.
            Manage hierarchical inventory, flexible payments, and site-specific logistics in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-jungle-700 hover:bg-jungle-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-jungle-700/20"
            >
              Start Procurement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/dashboard"
              className="px-8 py-4 bg-white border-2 border-suppblue-700 text-suppblue-700 hover:bg-suppblue-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Manage Supplier Store
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className=" mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-jungle-100 rounded-xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6 text-jungle-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">For Contractors</h3>
              <p className="text-slate-600">
                Browse deep inventory hierarchies across multiple sites. Select flexible payment plans that fit your project timelines.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-suppblue-100 rounded-xl flex items-center justify-center mb-6">
                <Store className="w-6 h-6 text-suppblue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">For Suppliers</h3>
              <p className="text-slate-600">
                Scale your reach. Configure complex product categorizations and define custom payment terms including 50/50 and installments.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Operations</h3>
              <p className="text-slate-600">
                Full role-based access control. Assign staff to specific branches or sites with verified credentials and operational heads.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
