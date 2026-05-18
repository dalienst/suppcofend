"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  Users,
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserCheck,
  Loader2,
  X,
  Check,
  AlertCircle,
  FileText,
  BadgeInfo,
  Link,
  Unlink,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// TypeScript Interfaces matching API response
interface Branch {
  reference: string
  name: string
  address: string | null
  identity: string
}

interface Role {
  reference: string
  name: string
  identity: string
  is_head: boolean
}

interface EmploymentDetail {
  role: string
  company: string
  is_active: boolean
  identity: string
  created_at: string
}

interface MiniBranchSiteDetail {
  id: number
  name: string
  address: string | null
  reference: string
  identity: string
}

interface EmployeeUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string | null
  identification: string | null
  kra_pin: string | null
  location: string | null
  assigned_branch: string | null
  assigned_site: string | null
  assigned_branch_details: MiniBranchSiteDetail | null
  assigned_site_details: MiniBranchSiteDetail | null
  employment: EmploymentDetail[]
}

// Zod Validation Schema for Employee Invitation
const inviteSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  identification: z.string().optional().or(z.literal("")),
  kra_pin: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "Selecting a role is required"),
  branch: z.string().optional().or(z.literal("")),
})

type InviteValues = z.infer<typeof inviteSchema>

export default function SupplierStaffPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assigningEmployee, setAssigningEmployee] = useState<EmployeeUser | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null)

  // Local states for frontend pagination & search
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // React Hook Form for employee invitation
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      identification: "",
      kra_pin: "",
      location: "",
      role: "",
      branch: "",
    }
  })

  // Queries
  // 1. Fetch Current Company Details to fetch identity
  const { data: company } = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      const response = await api.get("/api/v1/companies/my/")
      return response.data
    }
  })

  // 2. Fetch Employee Users List
  const { data: employeesData, isLoading: isLoadingStaff } = useQuery<EmployeeUser[]>({
    queryKey: ["supplier-staff"],
    queryFn: async () => {
      const response = await api.get("/api/v1/auth/add/employee/")
      return response.data.results || response.data
    }
  })

  // 3. Fetch Company Roles
  const { data: rolesData } = useQuery<Role[]>({
    queryKey: ["supplier-roles"],
    queryFn: async () => {
      const response = await api.get("/api/v1/roles/")
      return response.data.results || response.data
    }
  })

  // 4. Fetch Operational Branches
  const { data: branchesData } = useQuery<Branch[]>({
    queryKey: ["supplier-branches"],
    queryFn: async () => {
      const response = await api.get("/api/v1/branches/")
      return response.data.results || response.data
    }
  })

  // Mutations
  // 1. Post New Employee Invitation
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteValues) => {
      return api.post("/api/v1/auth/add/employee/", {
        ...data,
        company: company?.identity,
        role: data.role,
        branch: data.branch || undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-staff"] })
      toast.success("Employee invited successfully! Credentials email dispatched.")
      closeModal()
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        "Failed to invite employee."
      toast.error(errMsg)
    }
  })

  // 2. Assign Employee to Branch
  const assignMutation = useMutation({
    mutationFn: async ({ employeeUsername, branchIdentity }: { employeeUsername: string, branchIdentity: string }) => {
      return api.post("/api/v1/employees/assign/", {
        employee_username: employeeUsername,
        branch: branchIdentity
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-staff"] })
      toast.success("Employee assigned to branch successfully.")
      setAssigningEmployee(null)
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.non_field_errors?.[0] || "Failed to assign employee to branch."
      toast.error(errMsg)
    }
  })

  // 3. Unassign Employee from Branch
  const unassignMutation = useMutation({
    mutationFn: async (employeeUsername: string) => {
      return api.post("/api/v1/employees/unassign/", {
        employee_username: employeeUsername
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-staff"] })
      toast.success("Branch assignment removed.")
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.non_field_errors?.[0] || "Failed to remove assignment."
      toast.error(errMsg)
    }
  })

  // 4. Edit Employee Profile
  const editMutation = useMutation({
    mutationFn: async (data: InviteValues) => {
      if (!editingEmployee) return
      return api.patch(`/api/v1/auth/add/employee/${editingEmployee.username}/`, {
        ...data,
        company: company?.identity,
        role: data.role,
        branch: data.branch || null,
        password: data.password || undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-staff"] })
      toast.success("Employee details updated successfully.")
      closeModal()
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.first_name?.[0] ||
        err?.response?.data?.email?.[0] ||
        "Failed to update employee details."
      toast.error(errMsg)
    }
  })

  // 5. Delete/Deactivate Employee Profile
  const deleteMutation = useMutation({
    mutationFn: async (username: string) => {
      return api.delete(`/api/v1/auth/add/employee/${username}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-staff"] })
      toast.success("Employee account deleted/deactivated successfully.")
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.detail || "Failed to delete employee."
      toast.error(errMsg)
    }
  })

  const onSubmit = (data: InviteValues) => {
    if (!editingEmployee && !data.password) {
      toast.error("Temporary password is required for new invites.")
      return
    }
    if (editingEmployee) {
      editMutation.mutate(data)
    } else {
      inviteMutation.mutate(data)
    }
  }

  const openEditModal = (employee: EmployeeUser) => {
    setEditingEmployee(employee)
    reset({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      username: employee.username || "",
      email: employee.email || "",
      password: "",
      phone: employee.phone || "",
      identification: employee.identification || "",
      kra_pin: employee.kra_pin || "",
      location: employee.location || "",
      role: employee.employment?.[0]?.role || "",
      branch: employee.assigned_branch || "",
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
    reset({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      identification: "",
      kra_pin: "",
      location: "",
      role: "",
      branch: "",
    })
  }

  const handleQuickAssign = (branchIdentity: string) => {
    if (!assigningEmployee) return
    assignMutation.mutate({
      employeeUsername: assigningEmployee.username,
      branchIdentity
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  // Lookup helper lists
  const rawStaff = employeesData || []
  const roles = rolesData || []
  const branches = branchesData || []

  // Perform Local Search & Filtering
  const filteredStaff = rawStaff.filter((emp: EmployeeUser) =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchQuery))
  )

  // Perform Local Pagination
  const totalCount = filteredStaff.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const paginatedStaff = filteredStaff.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const hasNext = page < totalPages
  const hasPrevious = page > 1

  return (
    <div className="p-4 sm:p-8 container mx-auto space-y-8 pb-24">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff & Team Cockpit</h1>
          <p className="text-slate-500 mt-1">Invite corporate employees, define role assignments, and link branches.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-suppblue-600 hover:bg-suppblue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-suppblue-700/10 self-start sm:self-auto hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-5 h-5" />
          Invite Staff Member
        </button>
      </div>

      {/* Staff Roster Listing */}
      {isLoadingStaff ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-suppblue-600" />
        </div>
      ) : rawStaff.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-suppblue-50 text-suppblue-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">No active staff members</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You haven't invited any employees. Staff members can help manage physical branches, catalog listings, and order fullfilment.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            + Create/Invite Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

            {/* Table Header & Local Search */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search staff by name, email or username..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-suppblue-500/10 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  Frontend Filter: active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Employee Details</th>
                    <th className="px-6 py-4">Role & Status</th>
                    <th className="px-6 py-4">Security Info</th>
                    <th className="px-6 py-4">Physical Assignment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.map((employee: EmployeeUser) => {
                    const employment = employee.employment?.[0]
                    const employeeRoleIdentity = employment?.role
                    const matchedRole = roles.find(r => r.identity === employeeRoleIdentity)

                    return (
                      <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Name & Contact Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-suppblue-50 text-suppblue-700 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm uppercase">
                              {employee.first_name?.[0] || employee.username?.[0]}
                              {employee.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {employee.first_name} {employee.last_name}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">@{employee.username}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {employee.email}</span>
                                {employee.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {employee.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Details */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-suppblue-50 text-suppblue-700">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {matchedRole?.name || employeeRoleIdentity || "Employee"}
                            </span>
                            <div>
                              {matchedRole?.is_head ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Head of Branch
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-wide">
                                  Standard Personnel
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Security Documents */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-xs text-slate-600">
                            {employee.identification ? (
                              <p className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" /> ID: <strong className="text-slate-800">{employee.identification}</strong></p>
                            ) : (
                              <p className="text-slate-400 italic">No Identity Doc</p>
                            )}
                            {employee.kra_pin ? (
                              <p className="flex items-center gap-1"><BadgeInfo className="w-3.5 h-3.5 text-slate-400 shrink-0" /> KRA: <strong className="text-slate-800">{employee.kra_pin}</strong></p>
                            ) : (
                              <p className="text-slate-400 italic">No KRA Pin</p>
                            )}
                            {employee.location && (
                              <p className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {employee.location}</p>
                            )}
                          </div>
                        </td>

                        {/* Branch Assignment */}
                        <td className="px-6 py-4">
                          {employee.assigned_branch ? (
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-800 text-xs font-semibold shadow-sm">
                                <Building2 className="w-4 h-4 text-suppblue-600 shrink-0" />
                                <span className="max-w-[120px] truncate">
                                  {employee.assigned_branch_details?.name || employee.assigned_branch}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${employee.first_name} from their branch assignment?`)) {
                                    unassignMutation.mutate(employee.username)
                                  }
                                }}
                                disabled={unassignMutation.isPending}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove assignment"
                              >
                                <Unlink className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningEmployee(employee)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-suppblue-50 hover:text-suppblue-700 hover:border-suppblue-100 border border-transparent rounded-xl transition-all"
                            >
                              <Link className="w-3.5 h-3.5" />
                              Assign Branch
                            </button>
                          )}
                        </td>

                        {/* Active Indicator & Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0",
                              employment?.is_active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            )}>
                              {employment?.is_active ? "Active" : "Inactive"}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(employee)}
                                className="p-1.5 text-slate-400 hover:text-suppblue-700 hover:bg-suppblue-50 rounded-lg transition-all"
                                title="Edit Staff Profile"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you absolutely sure you want to delete and deactivate ${employee.first_name} ${employee.last_name}?`)) {
                                    deleteMutation.mutate(employee.username)
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete/Deactivate Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {!isLoadingStaff && paginatedStaff.length === 0 && (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-semibold">No employee records match your search keyword.</p>
              </div>
            )}

            {/* Local Pagination Footer Controls */}
            {totalCount > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 font-semibold shrink-0">
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
        </div>
      )}

      {/* Quick Branch Assignment Dialog */}
      {assigningEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-semibold text-lg text-slate-900">Link Branch Location</h2>
              <button
                onClick={() => setAssigningEmployee(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Select which operational branch to assign <strong>{assigningEmployee.first_name} {assigningEmployee.last_name}</strong> to:
            </p>

            {branches.length === 0 ? (
              <div className="text-center p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="text-xs text-slate-500">No branches configured.</p>
                <button
                  onClick={() => {
                    setAssigningEmployee(null)
                    window.location.href = "/supplier/branches"
                  }}
                  className="text-xs font-semibold text-suppblue-700 hover:underline"
                >
                  Configure Branches
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {branches.map((b) => (
                  <button
                    key={b.reference}
                    onClick={() => handleQuickAssign(b.identity)}
                    className="w-full p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-suppblue-50 hover:border-suppblue-200 hover:text-suppblue-700 text-left text-xs font-semibold transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{b.name}</span>
                    </div>
                    <Check className="w-4 h-4 text-suppblue-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setAssigningEmployee(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slide-over/Modal Invitation Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="font-bold text-xl text-slate-900">
                  {editingEmployee ? "Edit Staff Profile" : "Invite Corporate Personnel"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingEmployee
                    ? `Update contact credentials and assignments for ${editingEmployee.first_name}.`
                    : "Dispatches temporary credentials to employee's mailbox instantly."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* 1. Core Profile Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">Profile Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">First Name *</label>
                      <input
                        {...register("first_name")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="e.g. John"
                      />
                      {errors.first_name && <p className="text-[10px] text-red-500 ml-0.5">{errors.first_name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Last Name *</label>
                      <input
                        {...register("last_name")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="e.g. Doe"
                      />
                      {errors.last_name && <p className="text-[10px] text-red-500 ml-0.5">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Username *</label>
                      <input
                        {...register("username")}
                        disabled={!!editingEmployee}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="e.g. johndoe"
                      />
                      {errors.username && <p className="text-[10px] text-red-500 ml-0.5">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Email Address *</label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="e.g. john@suppco.com"
                      />
                      {errors.email && <p className="text-[10px] text-red-500 ml-0.5">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-0.5">
                      {editingEmployee ? "Update Password (Leave blank to keep current)" : "Temporary Credentials Password *"}
                    </label>
                    <input
                      type="text"
                      {...register("password")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none font-mono"
                      placeholder={editingEmployee ? "Optional new password" : "Input temporary pass for their initial login"}
                    />
                    {errors.password && <p className="text-[10px] text-red-500 ml-0.5">{errors.password.message}</p>}
                  </div>
                </div>

                {/* 2. Security Documentation & Location */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">Documentation & Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">National ID / Passport</label>
                      <input
                        {...register("identification")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="ID number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">KRA Tax PIN</label>
                      <input
                        {...register("kra_pin")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none uppercase"
                        placeholder="A012345678Z"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Phone Number</label>
                      <input
                        {...register("phone")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="e.g. +254 700 000 000"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Base Location</label>
                      <input
                        {...register("location")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none"
                        placeholder="e.g. Mombasa Central"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Assign Role & physical Branch */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">Company Assignments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Select Role Profile *</label>
                      <select
                        {...register("role")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none cursor-pointer"
                      >
                        <option value="">-- Choose Role --</option>
                        {roles.map(r => (
                          <option key={r.identity} value={r.identity}>{r.name} {r.is_head ? "(Head)" : ""}</option>
                        ))}
                      </select>
                      {errors.role && <p className="text-[10px] text-red-500 ml-0.5">{errors.role.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-0.5">Assign Branch (Optional)</label>
                      <select
                        {...register("branch")}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-suppblue-500/20 transition-all outline-none cursor-pointer"
                      >
                        <option value="">-- None / Head Office --</option>
                        {branches.map(b => (
                          <option key={b.reference} value={b.identity}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Form Footer actions */}
            <div className="p-6 border-t border-slate-100 shrink-0 flex gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors shadow-sm text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invite-form"
                disabled={inviteMutation.isPending || editMutation.isPending}
                className="flex-1 py-3 bg-suppblue-600 hover:bg-suppblue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm text-xs"
              >
                {inviteMutation.isPending || editMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {editingEmployee ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{editingEmployee ? "Save Changes" : "Send Corporate Invite"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
