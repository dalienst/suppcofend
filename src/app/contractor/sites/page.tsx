"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import Link from "next/link"
import { 
  MapPin, 
  Loader2, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Warehouse,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

// Types
interface Site {
  id: number
  reference: string
  name: string
  address: string | null
  user: string
  company: string
  created_at: string
}

// Validation Schema
const siteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().optional().or(z.literal("")),
})

type SiteValues = z.infer<typeof siteSchema>

export default function ContractorSitesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [deletingSite, setDeletingSite] = useState<Site | null>(null)
  
  // Local states for frontend pagination & search
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
    }
  })

  // Fetch Sites
  const { data: sitesData, isLoading } = useQuery({
    queryKey: ["contractor-sites"],
    queryFn: async () => {
      const response = await api.get("/api/v1/sites/")
      return response.data.results || response.data
    }
  })

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SiteValues) => {
      if (editingSite) {
        return api.patch(`/api/v1/sites/${editingSite.reference}/`, data)
      }
      return api.post("/api/v1/sites/", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-sites"] })
      closeModal()
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (reference: string) => {
      return api.delete(`/api/v1/sites/${reference}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-sites"] })
      setDeletingSite(null)
    },
  })

  const openModalForCreate = () => {
    setEditingSite(null)
    reset({ name: "", address: "" })
    setIsModalOpen(true)
  }

  const openModalForEdit = (site: Site) => {
    setEditingSite(site)
    reset({ 
      name: site.name, 
      address: site.address || "" 
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSite(null)
    reset({ name: "", address: "" })
  }

  const onSubmit = (data: SiteValues) => {
    saveMutation.mutate(data)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to page 1 on filter
  }

  const rawSites = sitesData || []

  // Perform Local Search & Filtering
  const filteredSites = rawSites.filter((site: Site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (site.address && site.address.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Perform Local Pagination
  const totalCount = filteredSites.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const paginatedSites = filteredSites.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const hasNext = page < totalPages
  const hasPrevious = page > 1

  return (
    <div className="p-4 mx-auto space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sites Management</h1>
          <p className="text-slate-500 mt-1">Add and manage your operational construction sites and locations.</p>
        </div>
        <button
          onClick={openModalForCreate}
          className="bg-jungle-600 hover:bg-jungle-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add Site
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-jungle-600" />
        </div>
      ) : rawSites.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-jungle-50 text-jungle-600 rounded-full flex items-center justify-center mx-auto">
            <Warehouse className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">No active sites</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You haven't added any construction sites. Create your first site to start tracking physical locations.</p>
          </div>
          <button
            onClick={openModalForCreate}
            className="mt-4 text-jungle-600 font-bold hover:text-jungle-700 text-sm inline-block"
          >
            + Create a construction site
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
                placeholder="Search sites by name or location..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/10 transition-all"
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
                  <th className="px-6 py-4">Site Details</th>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Physical Address</th>
                  <th className="px-6 py-4">Registered On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSites.map((site: Site) => (
                  <tr key={site.reference} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/contractor/sites/${site.reference}`} className="flex items-center gap-3 group/link hover:opacity-95">
                        <div className="w-10 h-10 bg-jungle-50 text-jungle-600 rounded-xl flex items-center justify-center shrink-0 group-hover/link:bg-jungle-600 group-hover/link:text-white transition-colors">
                          <Warehouse className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900 group-hover/link:text-jungle-700 transition-colors flex items-center gap-1">
                          {site.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400" />
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {site.reference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 max-w-xs">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{site.address || <span className="text-slate-400 italic">Not provided</span>}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(site.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModalForEdit(site)}
                          className="p-1.5 text-slate-400 hover:text-jungle-600 hover:bg-jungle-50 rounded-lg transition-colors"
                          title="Edit Site"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingSite(site)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Site"
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

          {!isLoading && paginatedSites.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Warehouse className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">No physical sites match your search keyword.</p>
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
                {editingSite ? "Edit Site" : "Add New Site"}
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
                <label className="text-sm font-bold text-slate-700 ml-1">Site Name <span className="text-red-500">*</span></label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                  placeholder="e.g. Riverside Estate Block B"
                />
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Physical Location</label>
                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none resize-none"
                  placeholder="e.g. Plot 15, Waiyaki Way"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-3 bg-jungle-600 text-white rounded-xl font-bold hover:bg-jungle-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSite ? "Save Changes" : "Create Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="font-black text-xl text-slate-900">Delete Site?</h2>
              <p className="text-slate-500 text-sm mt-2">
                Are you sure you want to delete <span className="font-bold text-slate-700">{deletingSite.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSite(null)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingSite.reference)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
