"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import * as z from "zod"
import { 
  useLayers, 
  useSublayers, 
  useSublayerItems, 
  useBrackets, 
  usePaymentOptions,
  useBranches
} from "@/hooks/useInventory"
import { Loader2, Plus, Info, Check } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

const productSchema = z.object({
  layer: z.string().min(1, "Layer is required"),
  sublayer: z.string().min(1, "Sublayer is required"),
  sublayeritem: z.string().min(1, "Sublayer Item is required"),
  bracket: z.string().min(1, "Bracket is required"),
  branch: z.string().optional(),
  product_name: z.string().min(3, "Product name is too short"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price cannot be negative"),
  payment_options: z.array(z.string()).min(1, "Select at least one payment option"),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      payment_options: [],
    }
  })

  const selectedLayer = watch("layer")
  const selectedSublayer = watch("sublayer")
  const selectedSublayerItem = watch("sublayeritem")
  const selectedPaymentOptions = watch("payment_options")

  const { data: layers } = useLayers()
  const { data: sublayers } = useSublayers(selectedLayer)
  const { data: sublayerItems } = useSublayerItems(selectedSublayer)
  const { data: brackets } = useBrackets(selectedSublayerItem)
  const { data: paymentOptions } = usePaymentOptions()
  const { data: branches } = useBranches()

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      await api.post("/api/v1/products/", data)
      router.push("/supplier/dashboard")
    } catch (error) {
      console.error("Failed to create product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePaymentOption = (ref: string) => {
    const current = selectedPaymentOptions
    if (current.includes(ref)) {
      setValue("payment_options", current.filter(item => item !== ref))
    } else {
      setValue("payment_options", [...current, ref])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-slate-900 mb-2">
          <Info className="w-5 h-5 text-suppblue-600" />
          <h2 className="text-lg font-bold">Category Hierarchy</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layer */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Level 1: Layer</label>
            <select 
              {...register("layer")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all"
            >
              <option value="">Select Layer</option>
              {layers?.map((l: any) => <option key={l.reference} value={l.reference}>{l.name}</option>)}
            </select>
            {errors.layer && <p className="text-xs text-red-500">{errors.layer.message}</p>}
          </div>

          {/* Sublayer */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Level 2: Sublayer</label>
            <select 
              {...register("sublayer")}
              disabled={!selectedLayer}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:opacity-50 outline-none transition-all"
            >
              <option value="">Select Sublayer</option>
              {sublayers?.map((s: any) => <option key={s.reference} value={s.reference}>{s.name}</option>)}
            </select>
          </div>

          {/* Sublayer Item */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Level 3: Item Category</label>
            <select 
              {...register("sublayeritem")}
              disabled={!selectedSublayer}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:opacity-50 outline-none transition-all"
            >
              <option value="">Select Item</option>
              {sublayerItems?.map((i: any) => <option key={i.reference} value={i.reference}>{i.name}</option>)}
            </select>
          </div>

          {/* Bracket */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Level 4: Bracket</label>
            <select 
              {...register("bracket")}
              disabled={!selectedSublayerItem}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:opacity-50 outline-none transition-all"
            >
              <option value="">Select Bracket</option>
              {brackets?.map((b: any) => <option key={b.reference} value={b.reference}>{b.name}</option>)}
            </select>
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Storage Branch (Optional)</label>
            <select 
              {...register("branch")}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
            >
              <option value="">Select Branch</option>
              {branches?.map((b: any) => <option key={b.identity} value={b.identity}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Display Name</label>
            <input 
              {...register("product_name")}
              placeholder="e.g. Portland Cement Grade 42.5"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Initial Quantity</label>
            <input 
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Unit of Measure</label>
            <input 
              {...register("unit")}
              placeholder="Bags, Tons, etc."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Unit Price (KES)</label>
            <input 
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all font-bold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Payment Options</h2>
        <p className="text-xs text-slate-500">Select terms you are willing to accept for this product.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentOptions?.map((opt: any) => (
            <button
              key={opt.reference}
              type="button"
              onClick={() => togglePaymentOption(opt.reference)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                selectedPaymentOptions.includes(opt.reference)
                  ? "border-suppblue-600 bg-suppblue-50 text-suppblue-700"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
              )}
            >
              <div>
                <p className="text-sm font-bold">{opt.name}</p>
                <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">{opt.payment_type}</p>
              </div>
              {selectedPaymentOptions.includes(opt.reference) && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-suppblue-700 hover:bg-suppblue-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-suppblue-700/20 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          List Product
        </button>
      </div>
    </form>
  )
}
