"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import { 
  PackageSearch, 
  Loader2, 
  Layers, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Box,
  LayoutGrid,
  Square,
  ArrowLeft,
  X
} from "lucide-react"

// --- Types ---
interface Bracket {
  reference: string;
  name: string;
}

interface SubLayerItem {
  reference: string;
  name: string;
  brackets: Bracket[];
}

interface SubLayer {
  reference: string;
  name: string;
  sublayeritems: SubLayerItem[];
}

interface Layer {
  reference: string;
  name: string;
  sublayers: SubLayer[];
}

interface InventoryDetail {
  reference: string;
  inventory_code: string;
  name: string;
  description: string;
  layers: Layer[];
}

type NodeType = "layer" | "sublayer" | "sublayeritem" | "bracket"

// --- Modal Schema ---
const nodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

type NodeValues = z.infer<typeof nodeSchema>

// --- Helper Components ---
// Recursive node components to keep code clean
const BracketNode = ({ bracket, onAssignProduct }: { bracket: Bracket, onAssignProduct: (type: NodeType, parentRef: string) => void }) => (
  <div className="pl-6 py-2 border-l-2 border-slate-100 ml-3">
    <div className="flex items-center gap-2 group">
      <Square className="w-4 h-4 text-slate-400" />
      <span className="text-sm font-medium text-slate-700">{bracket.name}</span>
      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {bracket.reference}
      </span>
      <button 
        onClick={(e) => { e.stopPropagation(); onAssignProduct("bracket", bracket.reference) }}
        className="ml-auto text-xs font-semibold text-suppblue-600 hover:text-suppblue-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Add Product
      </button>
    </div>
  </div>
)

const SublayerItemNode = ({ item, onAddChild, onAssignProduct }: { item: SubLayerItem, onAddChild: (type: NodeType, parentRef: string) => void, onAssignProduct: (type: NodeType, parentRef: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="pl-6 border-l-2 border-slate-200 ml-3">
      <div className="py-2 flex items-center gap-2 group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <LayoutGrid className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-800">{item.name}</span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 rounded-full">{item.brackets?.length || 0} brackets</span>
        
        <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => { e.stopPropagation(); onAddChild("bracket", item.reference) }}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm"
      >
        + Add Bracket
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onAssignProduct("sublayeritem", item.reference) }}
        className="text-xs font-semibold text-suppblue-600 hover:text-suppblue-700 flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Add Product
      </button>
    </div>
      </div>
      {isOpen && (
        <div className="mt-1">
          {item.brackets?.map(bracket => (
            <BracketNode key={bracket.reference} bracket={bracket} onAssignProduct={onAssignProduct} />
          ))}
          {(!item.brackets || item.brackets.length === 0) && (
            <div className="pl-6 py-2 text-xs text-slate-400 italic border-l-2 border-slate-100 ml-3">
              No brackets added yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SublayerNode = ({ sublayer, onAddChild, onAssignProduct }: { sublayer: SubLayer, onAddChild: (type: NodeType, parentRef: string) => void, onAssignProduct: (type: NodeType, parentRef: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="pl-6 border-l-2 border-slate-300 ml-3">
      <div className="py-3 flex items-center gap-2 group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <Box className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-semibold text-slate-900">{sublayer.name}</span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 rounded-full">{sublayer.sublayeritems?.length || 0} items</span>
        
        <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => { e.stopPropagation(); onAddChild("sublayeritem", sublayer.reference) }}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm"
      >
        + Add Sublayer Item
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onAssignProduct("sublayer", sublayer.reference) }}
        className="text-xs font-semibold text-suppblue-600 hover:text-suppblue-700 flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Add Product
      </button>
    </div>
      </div>
      {isOpen && (
        <div className="mt-1">
          {sublayer.sublayeritems?.map(item => (
            <SublayerItemNode key={item.reference} item={item} onAddChild={onAddChild} onAssignProduct={onAssignProduct} />
          ))}
          {(!sublayer.sublayeritems || sublayer.sublayeritems.length === 0) && (
            <div className="pl-6 py-2 text-xs text-slate-400 italic border-l-2 border-slate-200 ml-3">
              No sublayer items added yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const LayerNode = ({ 
  layer, 
  onAddChild, 
  onAssignProduct 
}: { 
  layer: Layer, 
  onAddChild: (type: NodeType, parentRef: string) => void, 
  onAssignProduct: (type: NodeType, parentRef: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* Layer Header */}
      <div className="bg-slate-50/50 p-4 flex items-center gap-3 cursor-pointer group border-b border-slate-100" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        <div className="w-8 h-8 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{layer.name}</h3>
          <p className="text-xs text-slate-500">{layer.sublayers?.length || 0} sublayers</p>
        </div>
        
        <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddChild("sublayer", layer.reference) }}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
          >
            + Add Sublayer (Rack)
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAssignProduct("layer", layer.reference) }}
            className="text-sm font-semibold text-suppblue-600 hover:text-suppblue-700 bg-suppblue-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>
      
      {/* Layer Children (Sublayers) */}
      {isOpen && (
        <div className="p-4 bg-white">
          {layer.sublayers?.map(sublayer => (
            <SublayerNode key={sublayer.reference} sublayer={sublayer} onAddChild={onAddChild} onAssignProduct={onAssignProduct} />
          ))}
          {(!layer.sublayers || layer.sublayers.length === 0) && (
            <div className="text-center py-6 text-sm text-slate-500 italic bg-slate-50 rounded-xl border border-slate-100">
              No sublayers inside this layer yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function InventoryExplorerPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const inventory_code = params?.inventory_code as string

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: NodeType;
    parentRef: string | null;
  }>({
    isOpen: false,
    type: "layer",
    parentRef: null,
  })

  const [productModal, setProductModal] = useState<{
    isOpen: boolean;
    type: NodeType;
    parentRef: string | null;
  }>({
    isOpen: false,
    type: "layer",
    parentRef: null,
  })

  const [selectedProductRef, setSelectedProductRef] = useState<string>("")

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NodeValues>({
    resolver: zodResolver(nodeSchema),
    defaultValues: { name: "" }
  })

  // Fetch Inventory Details (Recursive Tree)
  const { data: inventory, isLoading } = useQuery<InventoryDetail>({
    queryKey: ["inventory-detail", inventory_code],
    queryFn: async () => {
      const response = await api.get(`/api/v1/inventory/${inventory_code}/`)
      return response.data
    },
    enabled: !!inventory_code
  })

  // Fetch Supplier Products for linking
  const { data: productsData } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const response = await api.get("/api/v1/products/")
      return response.data.results || response.data
    }
  })

  // Node Creation Mutation
  const createNodeMutation = useMutation({
    mutationFn: async (data: NodeValues) => {
      let endpoint = ""
      let payload = {}
      
      switch (modalState.type) {
        case "layer":
          endpoint = "/api/v1/layers/list-create/"
          payload = { name: data.name, inventory: inventory_code }
          break;
        case "sublayer":
          endpoint = "/api/v1/sublayers/list-create/"
          payload = { name: data.name, layer: modalState.parentRef }
          break;
        case "sublayeritem":
          endpoint = "/api/v1/sublayeritems/list-create/"
          payload = { name: data.name, sublayer: modalState.parentRef }
          break;
        case "bracket":
          endpoint = "/api/v1/brackets/list-create/"
          payload = { name: data.name, sublayeritem: modalState.parentRef }
          break;
      }
      
      return api.post(endpoint, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-detail", inventory_code] })
      closeModal()
    }
  })

  const assignProductMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProductRef || !productModal.parentRef) return
      
      const payload: Record<string, string | null> = {
        layer: null,
        sublayer: null,
        sublayeritem: null,
        bracket: null
      }
      
      payload[productModal.type] = productModal.parentRef
      
      return api.patch(`/api/v1/products/${selectedProductRef}/`, payload)
    },
    onSuccess: () => {
      // Typically you might refetch the inventory if products are nested, 
      // but for now we just show success and close
      closeProductModal()
    }
  })

  const openModal = (type: NodeType, parentRef: string | null = null) => {
    setModalState({ isOpen: true, type, parentRef })
    reset({ name: "" })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: "layer", parentRef: null })
    reset({ name: "" })
  }

  const openProductModal = (type: NodeType, parentRef: string) => {
    setProductModal({ isOpen: true, type, parentRef })
    setSelectedProductRef("")
  }

  const closeProductModal = () => {
    setProductModal({ isOpen: false, type: "layer", parentRef: null })
    setSelectedProductRef("")
  }

  const onSubmitNode = (data: NodeValues) => {
    createNodeMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Inventory not found</h2>
        <button onClick={() => router.push("/supplier/inventory")} className="mt-4 text-suppblue-600 font-semibold">Return to Inventory List</button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button 
          onClick={() => router.push("/supplier/inventory")}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-suppblue-50 text-suppblue-600 rounded-2xl flex items-center justify-center shrink-0">
          <PackageSearch className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{inventory.name}</h1>
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono rounded-md border border-slate-200">
              {inventory.inventory_code}
            </span>
          </div>
          <p className="text-slate-500 mt-1">{inventory.description || "Visual hierarchy explorer for this inventory location."}</p>
        </div>
        <button
          onClick={() => openModal("layer")}
          className="ml-auto bg-suppblue-600 hover:bg-suppblue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Primary Layer (Aisle)
        </button>
      </div>

      {/* Visual Tree */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-suppblue-600" />
          Storage Structure
        </h2>
        
        {(!inventory.layers || inventory.layers.length === 0) ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500 mb-4">This inventory is currently empty.</p>
            <button onClick={() => openModal("layer")} className="text-suppblue-600 font-semibold hover:text-suppblue-700">
              + Add your first Layer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {inventory.layers.map(layer => (
              <LayerNode 
                key={layer.reference} 
                layer={layer} 
                onAddChild={openModal} 
                onAssignProduct={openProductModal} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Node Creation Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-xl text-slate-900 capitalize">
                Add {modalState.type}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitNode)} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1 capitalize">{modalState.type} Name <span className="text-red-500">*</span></label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                  placeholder={`e.g. ${modalState.type === 'layer' ? 'Aisle 1' : modalState.type === 'sublayer' ? 'Rack A' : 'Shelf 3'}`}
                />
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNodeMutation.isPending}
                  className="flex-1 py-3 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {createNodeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Assignment Modal */}
      {productModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-xl text-slate-900">
                Link Product to {productModal.type}
              </h2>
              <button 
                onClick={closeProductModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-500 leading-relaxed">
                Select an existing product from your catalog to assign it to this specific storage location. The product's previous layer location will be overwritten.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Select Product</label>
                <div className="relative">
                  <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedProductRef}
                    onChange={(e) => setSelectedProductRef(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-suppblue-500/20"
                  >
                    <option value="" disabled>-- Select a product --</option>
                    {productsData?.map((p: any) => (
                      <option key={p.reference} value={p.reference}>
                        {p.product_name || p.sku} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                {productsData?.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">You don't have any products in your catalog yet.</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => assignProductMutation.mutate()}
                  disabled={!selectedProductRef || assignProductMutation.isPending}
                  className="flex-1 py-3 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {assignProductMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Assign Location"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
