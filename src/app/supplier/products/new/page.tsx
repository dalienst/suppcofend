import { ProductForm } from "@/components/products/ProductForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  return (
    <div className="p-4 container mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/supplier/dashboard" 
          className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">List New Product</h1>
          <p className="text-slate-500">Add a product to your inventory with hierarchical categorization.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  )
}
