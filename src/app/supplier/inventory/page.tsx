"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { 
  PackageSearch, 
  Loader2, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers
} from "lucide-react"

// Types
interface Inventory {
  id: number
  reference: string
  inventory_code: string
  name: string
  description: string | null
  company: string
  user: string
  created_at: string
  layers: any[]
}

// Validation Schema
const inventorySchema = z.object({
  name: z.string().min(1, "Inventory name is required"),
  description: z.string().optional().or(z.literal("")),
})

type InventoryValues = z.infer<typeof inventorySchema>

export default function SupplierInventoryPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null)
  const [deletingInventory, setDeletingInventory] = useState<Inventory | null>(null)
  
  // Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InventoryValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      description: "",
    }
  })

  // Fetch Company for the 'company' payload (requires name)
  const { data: companyData } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/api/v1/companies/my/")
      return response.data
    }
  })

  // Fetch Inventories
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["supplier-inventory"],
    queryFn: async () => {
      const response = await api.get("/api/v1/inventory/")
      return response.data.results || response.data
    }
  })

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InventoryValues) => {
      if (editingInventory) {
        return api.patch(`/api/v1/inventory/${editingInventory.inventory_code}/`, data)
      }
      return api.post("/api/v1/inventory/list-create/", {
        ...data,
        company: companyData?.name // The serializer expects the company name
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-inventory"] })
      closeModal()
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (inventory_code: string) => {
      return api.delete(`/api/v1/inventory/${inventory_code}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-inventory"] })
      setDeletingInventory(null)
    },
  })

  const openModalForCreate = () => {
    setEditingInventory(null)
    reset({ name: "", description: "" })
    setIsModalOpen(true)
  }

  const openModalForEdit = (inv: Inventory) => {
    setEditingInventory(inv)
    reset({ 
      name: inv.name, 
      description: inv.description || "" 
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingInventory(null)
    reset({ name: "", description: "" })
  }

  const onSubmit = (data: InventoryValues) => {
    saveMutation.mutate(data)
  }

  const inventories = inventoryData || []

  return (
    <div className="p-4 sm:p-8 mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Create and manage your primary inventory storage spaces.</p>
        </div>
        <button
          onClick={openModalForCreate}
          className="bg-suppblue-600 hover:bg-suppblue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add Inventory
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
        </div>
      ) : inventories.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-suppblue-50 text-suppblue-600 rounded-full flex items-center justify-center mx-auto">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">No inventories yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Create an inventory to start tracking your products and layers.</p>
          </div>
          <button
            onClick={openModalForCreate}
            className="mt-4 text-suppblue-600 font-bold hover:text-suppblue-700 text-sm"
          >
            + Create an inventory
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Inventory Details</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Layers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventories.map((inv: Inventory) => (
                  <tr key={inv.inventory_code} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-suppblue-50 text-suppblue-600 rounded-xl flex items-center justify-center shrink-0">
                          <PackageSearch className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{inv.name}</span>
                          <span className="text-slate-500 font-mono text-xs mt-0.5">{inv.inventory_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 max-w-xs truncate">
                        {inv.description || <span className="text-slate-400 italic">No description</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{inv.layers?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModalForEdit(inv)}
                          className="p-1.5 text-slate-400 hover:text-suppblue-600 hover:bg-suppblue-50 rounded-lg transition-colors"
                          title="Edit Inventory"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingInventory(inv)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-xl text-slate-900">
                {editingInventory ? "Edit Inventory" : "Add New Inventory"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Inventory Name <span className="text-red-500">*</span></label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                  placeholder="e.g. Shell Equipment"
                />
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none resize-none"
                  placeholder="e.g. Inventory of Shell Equipment"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-3 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {editingInventory ? "Save Changes" : "Create Inventory"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">Delete Inventory?</h2>
              <p className="text-slate-500 text-sm mt-2">
                Are you sure you want to delete <strong>{deletingInventory.name}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingInventory(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingInventory.inventory_code)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
