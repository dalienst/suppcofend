"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { 
  Building2, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

// Types
interface Branch {
  id: number
  reference: string
  name: string
  address: string | null
  user: string
  company: string
  created_at: string
}

// Validation Schema
const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  address: z.string().optional().or(z.literal("")),
})

type BranchValues = z.infer<typeof branchSchema>

export default function SupplierBranchesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)
  
  // Local states for frontend pagination & search
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      address: "",
    }
  })

  // Fetch Branches
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ["supplier-branches"],
    queryFn: async () => {
      const response = await api.get("/api/v1/branches/")
      return response.data.results || response.data
    }
  })

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BranchValues) => {
      if (editingBranch) {
        return api.patch(`/api/v1/branches/${editingBranch.reference}/`, data)
      }
      return api.post("/api/v1/branches/", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-branches"] })
      closeModal()
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (reference: string) => {
      return api.delete(`/api/v1/branches/${reference}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-branches"] })
      setDeletingBranch(null)
    },
  })

  const openModalForCreate = () => {
    setEditingBranch(null)
    reset({ name: "", address: "" })
    setIsModalOpen(true)
  }

  const openModalForEdit = (branch: Branch) => {
    setEditingBranch(branch)
    reset({ 
      name: branch.name, 
      address: branch.address || "" 
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBranch(null)
    reset({ name: "", address: "" })
  }

  const onSubmit = (data: BranchValues) => {
    saveMutation.mutate(data)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to page 1 on filter
  }

  const rawBranches = branchesData || []

  // Perform Local Search & Filtering
  const filteredBranches = rawBranches.filter((branch: Branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Perform Local Pagination
  const totalCount = filteredBranches.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const paginatedBranches = filteredBranches.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const hasNext = page < totalPages
  const hasPrevious = page > 1

  return (
    <div className="p-4 mx-auto space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Management</h1>
          <p className="text-slate-500 mt-1">Add and manage your operational branches and locations.</p>
        </div>
        <button
          onClick={openModalForCreate}
          className="bg-suppblue-600 hover:bg-suppblue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add Branch
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
        </div>
      ) : rawBranches.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-suppblue-50 text-suppblue-600 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">No branches yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You haven't added any branches. Create your first branch to start managing locations.</p>
          </div>
          <button
            onClick={openModalForCreate}
            className="mt-4 text-suppblue-600 font-bold hover:text-suppblue-700 text-sm inline-block"
          >
            + Create a branch
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header / Local Search Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search branches by name or location..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-suppblue-500/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                Frontend Filter: active
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Branch Details</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Added On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBranches.map((branch: Branch) => (
                  <tr key={branch.reference} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/supplier/branches/${branch.reference}`} className="flex items-center gap-3 group/link hover:opacity-95">
                        <div className="w-10 h-10 bg-suppblue-50 text-suppblue-600 rounded-xl flex items-center justify-center shrink-0 group-hover/link:bg-suppblue-600 group-hover/link:text-white transition-colors">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900 group-hover/link:text-suppblue-700 transition-colors flex items-center gap-1">
                          {branch.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400" />
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {branch.reference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 max-w-xs">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{branch.address || <span className="text-slate-400 italic">Not provided</span>}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(branch.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModalForEdit(branch)}
                          className="p-1.5 text-slate-400 hover:text-suppblue-600 hover:bg-suppblue-50 rounded-lg transition-colors"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingBranch(branch)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Branch"
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

          {!isLoading && paginatedBranches.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">No physical branches match your search keyword.</p>
            </div>
          )}

          {/* Local Pagination Footer Controls */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 font-bold shrink-0">
              <div>
                Showing {Math.min(totalCount, (page - 1) * ITEMS_PER_PAGE + 1)} to{" "}
                {Math.min(totalCount, page * ITEMS_PER_PAGE)} of {totalCount} total entries
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrevious}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={!hasNext}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-xl text-slate-900">
                {editingBranch ? "Edit Branch" : "Add New Branch"}
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
                <label className="text-sm font-bold text-slate-700 ml-1">Branch Name <span className="text-red-500">*</span></label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                  placeholder="e.g. Mombasa Hub"
                />
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Physical Address</label>
                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none resize-none"
                  placeholder="e.g. Moi Avenue, Building XYZ"
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
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">Delete Branch?</h2>
              <p className="text-slate-500 text-sm mt-2">
                Are you sure you want to delete <strong>{deletingBranch.name}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingBranch(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingBranch.reference)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
