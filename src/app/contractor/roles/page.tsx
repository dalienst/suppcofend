"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  ShieldCheck,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Check
} from "lucide-react"
import toast from "react-hot-toast"

// Types
interface Permission {
  reference: string
  name: string
  codename: string
  description: string
}

interface Role {
  id: number
  reference: string
  name: string
  is_head: boolean
  company: string
  permissions: string[]
  permissions_details: {
    name: string
    codename: string
    description: string
  }[]
  created_at: string
}

// Validation Schema
const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  is_head: z.boolean(),
  permissions: z.array(z.string()),
})

type RoleValues = z.infer<typeof roleSchema>

export default function ContractorRolesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)

  // Form Setup
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      is_head: false,
      permissions: [],
    }
  })

  // Fetch Company Identity
  const { data: companyData } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/api/v1/companies/my/")
      return response.data
    }
  })

  // Fetch Roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["contractor-roles"],
    queryFn: async () => {
      const response = await api.get("/api/v1/roles/")
      return response.data.results || response.data
    }
  })

  // Fetch Permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const response = await api.get("/api/v1/permissions/")
      return response.data.results || response.data
    }
  })

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: RoleValues) => {
      if (editingRole) {
        return api.patch(`/api/v1/roles/${editingRole.reference}/`, data)
      }
      return api.post("/api/v1/roles/", {
        ...data,
        company: companyData?.identity
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-roles"] })
      closeModal()
    },
    onError: (err: any) => {
      console.error("Save Role Mutation Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      toast.error(err?.response?.data?.non_field_errors?.[0] || err?.response?.data?.detail || "Failed to save role.")
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (reference: string) => {
      return api.delete(`/api/v1/roles/${reference}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor-roles"] })
      setDeletingRole(null)
    },
    onError: (err: any) => {
      console.error("Delete Role Mutation Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      toast.error("Failed to delete role.")
    }
  })

  const openModalForCreate = () => {
    setEditingRole(null)
    reset({ name: "", is_head: false, permissions: [] })
    setIsModalOpen(true)
  }

  const openModalForEdit = (role: Role) => {
    setEditingRole(role)
    reset({
      name: role.name,
      is_head: role.is_head,
      permissions: role.permissions || []
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
    reset({ name: "", is_head: false, permissions: [] })
  }

  const onSubmit = (data: RoleValues) => {
    saveMutation.mutate(data)
  }

  const roles = rolesData || []
  const availablePermissions = permissionsData || []

  return (
    <div className="p-4 sm:p-8 mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 mt-1">Define custom roles and assign access levels for your site managers and team.</p>
        </div>
        <button
          onClick={openModalForCreate}
          className="bg-jungle-600 hover:bg-jungle-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      {isLoadingRoles ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-jungle-600" />
        </div>
      ) : roles.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-jungle-50 text-jungle-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">No roles defined</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Create custom roles like "Site Manager" or "Foreman" to securely manage your construction staff.</p>
          </div>
          <button
            onClick={openModalForCreate}
            className="mt-4 text-jungle-600 font-semibold hover:text-jungle-700 text-sm"
          >
            + Create your first role
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Role Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Permissions Attached</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((role: Role) => (
                  <tr key={role.reference} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-jungle-50 text-jungle-600 rounded-xl flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {role.is_head ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-jungle-100 text-jungle-700 uppercase tracking-wide">
                          <UserCheck className="w-3 h-3" />
                          Department Head
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wide">
                          Standard Role
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {role.permissions_details?.slice(0, 3).map(p => (
                          <span key={p.codename} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                            {p.name}
                          </span>
                        ))}
                        {role.permissions_details?.length > 3 && (
                          <span className="px-2 py-1 bg-slate-50 text-slate-400 text-xs rounded-md border border-slate-200">
                            +{role.permissions_details.length - 3} more
                          </span>
                        )}
                        {!role.permissions_details?.length && (
                          <span className="text-slate-400 italic text-xs">No permissions assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModalForEdit(role)}
                          className="p-1.5 text-slate-400 hover:text-jungle-600 hover:bg-jungle-50 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingRole(role)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Role"
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
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-xl text-slate-900">
                {editingRole ? "Edit Role Details" : "Create New Role"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Role Title</label>
                  <input
                    {...register("name")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-jungle-500/20 transition-all outline-none"
                    placeholder="e.g. Lead Site Foreman"
                  />
                  {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      {...register("is_head")}
                      className="w-5 h-5 rounded border-slate-300 text-jungle-600 focus:ring-jungle-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-900 text-sm">Department Head Level</label>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      If enabled, this role will grant overriding authority and visibility over standard operational tiers.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Assigned Permissions</label>
                  {isLoadingPermissions ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-jungle-600" />
                      Loading permissions database...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto p-1">
                      {availablePermissions.map((perm: Permission) => (
                        <Controller
                          key={perm.codename}
                          name="permissions"
                          control={control}
                          render={({ field }) => {
                            const isChecked = field.value?.includes(perm.codename) || false;
                            return (
                              <div
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${isChecked ? 'bg-jungle-50 border-jungle-200' : 'bg-white border-slate-200 hover:border-jungle-200'
                                  }`}
                                onClick={() => {
                                  const newValue = isChecked
                                    ? field.value.filter((v: string) => v !== perm.codename)
                                    : [...(field.value || []), perm.codename];
                                  field.onChange(newValue);
                                }}
                              >
                                <div className="relative flex items-center mt-0.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="peer appearance-none w-4 h-4 border border-slate-300 rounded focus:outline-none checked:bg-jungle-600 checked:border-jungle-600 transition-all cursor-pointer"
                                  />
                                  <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <div>
                                  <p className={`text-xs font-semibold ${isChecked ? 'text-jungle-900' : 'text-slate-700'}`}>
                                    {perm.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{perm.description}</p>
                                </div>
                              </div>
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2.5 bg-jungle-600 text-white rounded-xl font-semibold text-sm hover:bg-jungle-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingRole ? "Save Role Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-bold text-xl text-slate-900">Delete Role?</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Are you sure you want to delete the <span className="font-semibold text-slate-700">{deletingRole.name}</span> role? Users assigned this role may lose access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingRole.reference)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
