"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import { 
  Package, 
  ArrowLeft, 
  Settings, 
  Layers, 
  Coins, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Info,
  Check,
  Tag,
  Boxes,
  MapPin,
  ClipboardList
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// Types matching backend models
interface PaymentOption {
  reference: string;
  name: string;
  payment_type: string;
}

interface ProductDetail {
  reference: string;
  sku: string;
  product_name: string;
  quantity: string | number;
  unit: string;
  price: string | number;
  source_location: string | null;
  specifications: Record<string, any> | null;
  layer: string | null;
  sublayer: string | null;
  sublayeritem: string | null;
  bracket: string | null;
  branch: string | null;
  layer_details?: { reference: string; name: string } | null;
  sublayer_details?: { reference: string; name: string } | null;
  sublayeritem_details?: { reference: string; name: string } | null;
  bracket_details?: { reference: string; name: string } | null;
  payment_options_details: PaymentOption[];
  payment_options: string[];
}

const editProductSchema = z.object({
  product_name: z.string().min(3, "Name must be at least 3 characters"),
  quantity: z.union([z.number(), z.string()]),
  price: z.union([z.number(), z.string()]),
  unit: z.string().optional().or(z.literal("")),
  source_location: z.string().optional().or(z.literal("")),
})

type EditProductValues = z.infer<typeof editProductSchema>

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const reference = params?.reference as string

  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "specs" | "payment">("overview")
  const [specRows, setSpecRows] = useState<{ id: string; key: string; value: string }[]>([])
  const [selectedPaymentOpts, setSelectedPaymentOpts] = useState<string[]>([])

  // Query: Fetch Product details
  const { data: product, isLoading, error } = useQuery<ProductDetail>({
    queryKey: ["product-detail", reference],
    queryFn: async () => {
      const response = await api.get(`/api/v1/products/${reference}/`)
      return response.data
    },
    enabled: !!reference,
  })

  // Query: Fetch Payment Options
  const { data: allPaymentOptions } = useQuery<PaymentOption[]>({
    queryKey: ["paymentoptions"],
    queryFn: async () => {
      const response = await api.get("/api/v1/paymentoptions/")
      return response.data.results
    }
  })

  // React Hook Form for core editing
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditProductValues>({
    resolver: zodResolver(editProductSchema)
  })

  // Reset form and specifications list once data is loaded
  useEffect(() => {
    if (product) {
      reset({
        product_name: product.product_name || "",
        quantity: Number(product.quantity) || 0,
        price: Number(product.price) || 0,
        unit: product.unit || "",
        source_location: product.source_location || ""
      })
      setSelectedPaymentOpts(product.payment_options || [])

      if (product.specifications) {
        const rows = Object.entries(product.specifications).map(([key, val], idx) => ({
          id: String(idx),
          key,
          value: String(val)
        }))
        setSpecRows(rows)
      } else {
        setSpecRows([])
      }
    }
  }, [product, reset])

  // Mutation: Patch Product
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.patch(`/api/v1/products/${reference}/`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-detail", reference] })
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] })
      toast.success("Product updated successfully!")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.non_field_errors?.[0] || "Failed to update product.")
    }
  })

  const handleCoreUpdate = (data: EditProductValues) => {
    const payload = {
      ...data,
      quantity: Number(data.quantity),
      price: Number(data.price)
    }
    updateMutation.mutate(payload)
  }

  // Specifications builder actions
  const addSpecRow = () => {
    setSpecRows([...specRows, { id: crypto.randomUUID(), key: "", value: "" }])
  }

  const removeSpecRow = (id: string) => {
    setSpecRows(specRows.filter(r => r.id !== id))
  }

  const updateSpecRow = (id: string, field: "key" | "value", val: string) => {
    setSpecRows(specRows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  const handleSaveSpecifications = () => {
    // Validate rows
    const cleanedSpecs: Record<string, string> = {}
    for (const row of specRows) {
      if (!row.key.trim()) {
        toast.error("Specification keys cannot be blank.")
        return
      }
      cleanedSpecs[row.key.trim()] = row.value.trim()
    }

    updateMutation.mutate({
      specifications: cleanedSpecs
    })
  }

  // Payment Option selection actions
  const togglePaymentOption = (optRef: string) => {
    if (selectedPaymentOpts.includes(optRef)) {
      setSelectedPaymentOpts(selectedPaymentOpts.filter(r => r !== optRef))
    } else {
      setSelectedPaymentOpts([...selectedPaymentOpts, optRef])
    }
  }

  const handleSavePaymentOptions = () => {
    updateMutation.mutate({
      payment_options: selectedPaymentOpts
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-suppblue-600" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-slate-500">The product reference might be invalid or you may not have permission to view it.</p>
        <button 
          onClick={() => router.push("/supplier/products")}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
        >
          Return to Catalog
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 container mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/supplier/products")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-suppblue-50 text-suppblue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-suppblue-100">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{product.product_name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">SKU: {product.sku}</span>
              <span>•</span>
              <span className="font-medium text-emerald-600">KES {Number(product.price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === "overview"
              ? "border-suppblue-600 text-suppblue-600 bg-suppblue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <ClipboardList className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={cn(
            "px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === "edit"
              ? "border-suppblue-600 text-suppblue-600 bg-suppblue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <Edit3 className="w-4 h-4" /> Edit Details
        </button>
        <button
          onClick={() => setActiveTab("specs")}
          className={cn(
            "px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === "specs"
              ? "border-suppblue-600 text-suppblue-600 bg-suppblue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <Settings className="w-4 h-4" /> Specifications
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={cn(
            "px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === "payment"
              ? "border-suppblue-600 text-suppblue-600 bg-suppblue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <Coins className="w-4 h-4" /> Payment Options
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic Details Pane (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Product Summary</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Stock</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{product.quantity} <span className="text-sm font-normal text-slate-500">{product.unit || "units"}</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Price</p>
                  <p className="text-2xl font-black text-suppblue-600 mt-1">KES {Number(product.price).toLocaleString()}</p>
                </div>
              </div>

              {/* Location Stack */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-suppblue-600" />
                  Assigned Storage Location
                </h3>
                
                {product.layer_details ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">Layer: {product.layer_details.name}</span>
                      {product.sublayer_details && <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">Sublayer: {product.sublayer_details.name}</span>}
                      {product.sublayeritem_details && <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">Shelf: {product.sublayeritem_details.name}</span>}
                      {product.bracket_details && <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">Bin: {product.bracket_details.name}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm flex gap-2">
                    <Info className="w-5 h-5 shrink-0 text-yellow-600" />
                    <div>
                      <p className="font-bold">Not located in any layout yet</p>
                      <p className="text-xs text-yellow-700 mt-0.5">You can quickly assign this product to a storage slot inside the visual Inventory Structure editor.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specs overview */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-suppblue-600" />
                  Specifications
                </h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex text-sm p-3 hover:bg-slate-50/50 transition-colors">
                        <span className="w-1/3 font-bold text-slate-500">{key}</span>
                        <span className="w-2/3 text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No specifications listed. Click the Specifications tab above to add details like dimensions, grade, or materials.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDIT DETAILS */}
          {activeTab === "edit" && (
            <form onSubmit={handleSubmit(handleCoreUpdate)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">Modify Core Info</h2>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-suppblue-600 hover:bg-suppblue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Core Details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Display Name</label>
                  <input
                    {...register("product_name")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all"
                  />
                  {errors.product_name && <p className="text-xs text-red-500 mt-1">{errors.product_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Initial Quantity</label>
                  <input
                    type="number"
                    {...register("quantity")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all"
                  />
                  {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Unit of Measure</label>
                  <input
                    {...register("unit")}
                    placeholder="Pieces, bags, kg..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Price (KES)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all font-bold text-slate-800"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Source Location (Optional)</label>
                  <input
                    {...register("source_location")}
                    placeholder="e.g. Warehouse 4B, Nairobi"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Custom Attributes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Add specialized attributes like dimension, chemical grade, raw material, or certifications.</p>
                </div>
                <button
                  onClick={handleSaveSpecifications}
                  disabled={updateMutation.isPending}
                  className="bg-suppblue-600 hover:bg-suppblue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Specifications
                </button>
              </div>

              {specRows.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl space-y-3">
                  <p className="text-sm text-slate-500">No specifications added to this catalog listing yet.</p>
                  <button 
                    onClick={addSpecRow}
                    className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Add First Attribute
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {specRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3 animate-in slide-in-from-top-1 duration-150">
                      <input
                        placeholder="Attribute (e.g. Thickness)"
                        value={row.key}
                        onChange={(e) => updateSpecRow(row.id, "key", e.target.value)}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none"
                      />
                      <input
                        placeholder="Value (e.g. 12mm)"
                        value={row.value}
                        onChange={(e) => updateSpecRow(row.id, "value", e.target.value)}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/10 focus:border-suppblue-600 outline-none"
                      />
                      <button
                        onClick={() => removeSpecRow(row.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
                        title="Delete attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={addSpecRow}
                    className="text-xs font-bold text-suppblue-700 bg-suppblue-50 hover:bg-suppblue-100 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT OPTIONS */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Supported Payment Policies</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select which store-wide policies you want to accept specifically for this product.</p>
                </div>
                <button
                  onClick={handleSavePaymentOptions}
                  disabled={updateMutation.isPending}
                  className="bg-suppblue-600 hover:bg-suppblue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Payment Methods
                </button>
              </div>

              {!allPaymentOptions || allPaymentOptions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-sm text-slate-500">You haven't configured any payment options yet.</p>
                  <button
                    onClick={() => router.push("/supplier/payment-options")}
                    className="text-xs font-bold text-white bg-suppblue-600 hover:bg-suppblue-700 px-4 py-2 rounded-lg"
                  >
                    Configure Payment Options
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allPaymentOptions.map((opt) => {
                    const isSelected = selectedPaymentOpts.includes(opt.reference)
                    return (
                      <button
                        key={opt.reference}
                        onClick={() => togglePaymentOption(opt.reference)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                          isSelected
                            ? "border-suppblue-600 bg-suppblue-50 text-suppblue-700 font-bold"
                            : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                        )}
                      >
                        <div>
                          <p className="text-sm font-bold">{opt.name}</p>
                          <p className="text-[10px] opacity-70 mt-1 uppercase font-mono">{opt.payment_type}</p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-suppblue-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Quick Action Stats Card (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Listing Status</h3>
            
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-900">Active & Listed</p>
                <p className="text-xs text-slate-400 mt-0.5">Visible to contractors in Marketplace</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>SKU Code:</span>
                <span className="font-mono text-slate-800 font-bold">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="text-slate-800">{(product as any).created_at ? new Date((product as any).created_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Policies:</span>
                <span className="text-slate-800 font-bold">{product.payment_options_details?.length || 0} accepted</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <a
                href="/marketplace"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-center block"
              >
                View on Marketplace
              </a>
            </div>
          </div>
          
          {/* Quick specs overview card */}
          {activeTab !== "specs" && product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Specs</h3>
              <div className="space-y-2.5">
                {Object.entries(product.specifications).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500 capitalize">{k}:</span>
                    <span className="text-slate-950 font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
